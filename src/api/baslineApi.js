import axios from "axios";

// 假設的環境變數，對應你 ngrok 的測試網址
const BASE_URL = "https://repulsive-contour-mobster.ngrok-free.dev/api";

// 在記憶體或本地儲存中管理 Token
let tokens = {
    accessToken: localStorage.getItem("token"),
    refreshToken: localStorage.getItem("refreshToken"),
};

const setTokens = (accessToken, refreshToken) => {
    tokens.accessToken = accessToken || null;
    tokens.refreshToken = refreshToken || null;

    if (tokens.accessToken) {
        localStorage.setItem("token", tokens.accessToken);
    } else {
        localStorage.removeItem("token");
    }

    if (tokens.refreshToken) {
        localStorage.setItem("refreshToken", tokens.refreshToken);
    } else {
        localStorage.removeItem("refreshToken");
    }
};

const hydrateTokens = () => {
    if (!tokens.accessToken) {
        tokens.accessToken = localStorage.getItem("token");
    }
    if (!tokens.refreshToken) {
        tokens.refreshToken = localStorage.getItem("refreshToken");
    }
};

// 避免多個併發請求同時觸發 refresh 的旗標與佇列
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((prom) => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const isAuthError = (error) => {
    const status = error.response?.status;
    return status === 401 || status === 403 || error.message === "SESSION_EXPIRED";
};

const isUnsuccessfulResponse = (res) => res?.success === false;

const postCreateOption = async (path, payloads) => {
    let lastError = null;

    for (const payload of payloads) {
        try {
            const res = await apiClient.post(path, payload);
            if (!isUnsuccessfulResponse(res)) return res;

            lastError = new Error(res.message || res.error || "API 回傳失敗");
            lastError.responseData = res;
        } catch (error) {
            if (isAuthError(error)) throw error;
            lastError = error;
        }
    }

    throw lastError || new Error("API 回傳失敗");
};

// 建立 Axios 實例
const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

/**
 * 3. 攔截器：每次 Request 自動注入最新的 accessToken
 */
apiClient.interceptors.request.use(
    (config) => {
        hydrateTokens();
        console.log(tokens);
        if (tokens.accessToken) {
            config.headers.Authorization = `Bearer ${tokens.accessToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

/**
 * 4. 攔截器：當 accessToken 失敗後先自動 refresh，refresh 失敗則清除憑證要求重新登入
 */
apiClient.interceptors.response.use(
    (response) => {
        // 配合你的 responseMiddleware，只要 HTTP 狀態碼為 2xx 即返回系統包裝的內部資料
        return response.data;
    },
    async (error) => {
        const originalRequest = error.config;

        // 檢查是否為 401 Unauthorized 錯誤且該請求尚未重試過
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry
        ) {
            // 如果已經在刷新中，將當前請求推進佇列，等待刷新完成
            if (isRefreshing) {
                return new Promise((resolve, reject) => {
                    failedQueue.push({ resolve, reject });
                })
                    .then((token) => {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                        return apiClient(originalRequest);
                    })
                    .catch((err) => Promise.reject(err));
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                // 呼叫更新 Token 端點
                const response = await axios.post(
                    `${BASE_URL}/refresh`,
                    {
                        refreshToken: tokens.refreshToken,
                    },
                    { timeout: 5000 }
                );

                if (response.data && response.data.success) {
                    const newAccessToken = response.data.data.accessToken;
                    setTokens(newAccessToken, tokens.refreshToken);

                    // 釋放等待佇列
                    processQueue(null, newAccessToken);

                    // 重新發送原本失敗的請求
                    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                    return apiClient(originalRequest);
                } else {
                    // 🛠️ 修正漏洞：如果後端回傳 200 但 success 是 false，手動拋出錯誤走向 catch
                    throw new Error("REFRESH_FAILED_BY_SERVER");
                }
            } catch (refreshError) {
                // Refresh 也失敗了：清除 Token 並拋出明確錯誤告知前端應引導至登入頁面
                processQueue(refreshError, null);
                setTokens(null, null);
                console.error("🔑 Refresh Token 已過期或失效，請重新登入！");
                return Promise.reject(new Error("SESSION_EXPIRED"));
            } finally {
                isRefreshing = false;
            }
        }

        return Promise.reject(error);
    }
);

// export { apiClient, tokens };

const danceStudioSDK = {
    /* ========================================================================
     * 🔓 1. 免檢驗路由 (公開查詢)
     * 不需要驗證，多用於初始瀏覽、註冊與登入
     * ======================================================================== */

    /**
     * 登入系統 (取得 Token 憑證)
     * @param {string} account - 手機號碼 (格式: /^09\d{8}$/ or string)
     * @param {string} password - 密碼 (8-16碼，需含英數)
     * @returns {Promise<Object>} Response JSON
     * - Input: { account, password }
     * - Output: { success: true, data: { accessToken, refreshToken, id, name, roles: ["USER", "ADMIN"] ... } }
     */
    async login(account, password) {
        try {
            const res = await apiClient.post("/login", { account, password });
            if (res.success) {
                console.log(res);
                setTokens(res.data.accessToken, res.data.refreshToken);
            }
            console.log("[SDK LOG] login response:", JSON.stringify(res, null, 2));
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] login failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 註冊新會員
     * @param {Object} payload
     * - Schema: { name(string), phone(/^09\d{8}$/), password(8-16碼英數), birth(YYYY/MM/DD), gender("MALE"|"FEMALE"), email(選填), address(選填) }
     * @returns {Promise<Object>} Output: { success: true, data: { id, name, phone, isActive: true, ... } }
     */
    async register(payload) {
        try {
            const res = await apiClient.post("/register", payload);
            console.log("[SDK LOG] register response:", JSON.stringify(res, null, 2));
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] register failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    /**
     * 註冊新Admin
     * @param {Object} payload
     * - Schema: { name(string), password(8-16碼英數), email(選填) }
     * @returns {Promise<Object>} Output: { success: true, data: { id, name, phone, isActive: true, ... } }
     */
    async adminRegister(payload) {
        try {
            const res = await apiClient.post("/adminRegister", payload);
            console.log("[SDK LOG] register response:", JSON.stringify(res, null, 2));
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] register failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取場館清單與內含教室
     * @returns {Promise<Object>} Output: { success: true, data: Array<{ id, name, address, phone, rooms: string[] }> }
     */
    async getVenuesDetail() {
        try {
            const res = await apiClient.post("/getVenuesDetail", {});
            console.log(
                "[SDK LOG] getVenuesDetail response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getVenuesDetail failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取所有教室詳細規格
     * @returns {Promise<Object>} Output: { success: true, data: Array<{ id, venueId, name, maxCapacity, venueName }> }
     */
    async getRoomsDetail() {
        try {
            const res = await apiClient.post("/getRoomsDetail", {});
            console.log(
                "[SDK LOG] getRoomsDetail response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getRoomsDetail failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取架上商品與其內含的所有規格包
     * @returns {Promise<Object>} Output: { success: true, data: Array<{ id, name, description, productType: "POINTS"|"TICKET", packages: Array<{ quantity, expiryDays, price, isActive }> }> }
     */
    async getProductsDetail() {
        try {
            const res = await apiClient.post("/getProductsDetail", {});
            console.log(
                "[SDK LOG] getProductsDetail response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getProductsDetail failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取所有規格包獨立清單 (含所屬商品範本資訊)
     * @returns {Promise<Object>} Output: { success: true, data: Array<{ id, productId, name, quantity, expiryDays, price, isActive, product: { name, productType } }> }
     */
    async getPackagesDetail() {
        try {
            const res = await apiClient.post("/getPackagesDetail", {});
            console.log(
                "[SDK LOG] getPackagesDetail response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getPackagesDetail failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 公開獲取所有授課師資名單
     * @returns {Promise<Object>} Output: { success: true, data: Array<{ id, name, bio, venues: string[], courseCategories: string[] }> }
     */
    async getTeachersDetail() {
        try {
            const res = await apiClient.post("/getTeachersDetail", {});
            console.log(
                "[SDK LOG] getTeachersDetail response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getTeachersDetail failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取系統開班授課形式清單
     * @returns {Promise<Object>} Output: { success: true, data: ["團體課", "私人課", "體驗課", "大師課", "專業課"] }
     */
    async getCourseTypes() {
        try {
            const res = await apiClient.post("/getCourseTypes", {});
            console.log(
                "[SDK LOG] getCourseTypes response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getCourseTypes failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取系統所有核心舞風分類清單
     * @returns {Promise<Object>} Output: { success: true, data: ["Hip-Hop", "Popping", "Locking", "Jump"] }
     */
    async getCourseCategories() {
        try {
            const res = await apiClient.post("/getCourseCategories", {});
            console.log(
                "[SDK LOG] getCourseCategories response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getCourseCategories failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取單堂課程課表詳情 (含篩選功能)
     * @param {number} year - 選填，當有 month 時則為必填
     * @param {number} month - 選填
     * @returns {Promise<Object>} Output: { success: true, data: Array<{ id, title, startTime, endTime, minCapacity, maxCapacity, status: CourseStatus, teacher, category, venue, room, paymentMethods: [], bookedCount }> }
     */
    async getCoursesDetail(year = undefined, month = undefined) {
        try {
            if (month !== undefined && !year) {
                throw new Error("無法單獨提供 month, 請在提供 year");
            }
            const res = await apiClient.post("/getCoursesDetail", { year, month });
            console.log(
                "[SDK LOG] getCoursesDetail response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getCoursesDetail failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取週期性期課系列清單
     * @param {number} year - 選填，當有 month 時則為必填
     * @param {number} month - 選填
     * @returns {Promise<Object>} Output: { success: true, data: Array<{ id, title, description, totalClasses, status, courses: Array<{ id, seriesSequence, startTime, endTime, status }> }> }
     */
    async getCourseSeriesList(year = undefined, month = undefined) {
        try {
            if (month !== undefined && !year) {
                throw new Error("無法單獨提供 month, 請在提供 year");
            }
            const res = await apiClient.post("/getCourseSeriesList", { year, month });
            console.log(
                "[SDK LOG] getCourseSeriesList response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getCourseSeriesList failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /* ========================================================================
     * 🔒 2. 會員驗證層級路由 (需驗證 Token)
     * 已登入之個人資料、交易、預約相關 API (含自訂之 controller 內部深度安全檢查)
     * ======================================================================== */

    /**
     * 登出單一裝置 (清除當前 refreshToken)
     * - Schema: { refreshToken: string }
     */
    async logout(refreshToken) {
        try {
            const res = await apiClient.post("/logout", { refreshToken });
            console.log("[SDK LOG] logout response:", JSON.stringify(res, null, 2));
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] logout failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 登出此帳號之全館所有裝置 (強制使所有舊 Token 失效)
     * - Schema: { userId: number }
     */
    async logoutAll(userId) {
        try {
            const res = await apiClient.post("/logoutAll", { userId });
            console.log(
                "[SDK LOG] logoutAll response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] logoutAll failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 獲取指定會員之個人帳戶核心資訊 (點數、票券餘額、歷史流水與旅伴)
     * - Schema: { userId: number }
     * - Output: { success: true, data: { id, name, roles: [], companions: [], points: number, tickets: Array<{ name, totalRemain, details: [] }> } }
     */
    async getUserDetails(userId) {
        try {
            const res = await apiClient.post("/getUserDetails", { userId });
            console.log(
                "[SDK LOG] getUserDetails response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getUserDetails failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 更新使用者基本資料
     * - Schema: { userId, name(選填), phone(選填), password(選填), email(選填), address(選填) }
     * - Output: { success: true, data: { id, name, phone, birth, gender, roles: [] } }
     */
    async updateUserDetails(payload) {
        try {
            const res = await apiClient.post("/updateUserDetails", payload);
            console.log(
                "[SDK LOG] updateUserDetails response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateUserDetails failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台刪除/停用會員帳號
     * - Schema: { userId: number }
     */
    async deleteUser(userId) {
        let lastError = null;

        for (const path of ["/deleteUser", "/deactiveUser"]) {
            try {
                const res = await apiClient.post(path, { userId });
                console.log(
                    `[SDK LOG] ${path} response:`,
                    JSON.stringify(res, null, 2)
                );
                if (!isUnsuccessfulResponse(res)) return res;

                lastError = new Error(res.message || res.error || "刪除會員失敗");
            } catch (error) {
                if (isAuthError(error)) throw error;
                lastError = error;
            }
        }

        throw lastError || new Error("刪除會員失敗");
    },

    /**
     * 批次更新/同步旅伴(同行人)清單 (含新增、修改、軟刪除機制)
     * - Schema: { userId, companions: Array<{ id(選填,無則視為新增), name(必填), phone(選填), note(選填), isActive(boolean) }> }
     * - Output: { success: true, data: { id, name, companions: Array<{ id, name, note, isActive }> } }
     */
    async updateUserCompanions(payload) {
        try {
            const res = await apiClient.post("/updateUserCompanions", payload);
            console.log(
                "[SDK LOG] updateUserCompanions response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateUserCompanions failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 查詢個人/全館訂單歷史紀錄
     * - Schema: { userId(選填，不傳且身分為 Admin 則拿取全館訂單), page, pageSize }
     * - Output: { success: true, data: Array<{ id, orderNo, totalAmount, status: "PENDING"|"APPROVE"|"REJECTED", items: [] }>, count, page, pageSize, totalPages }
     */
    async getOrders(payload = {}) {
        try {
            const res = await apiClient.post("/getOrders", payload);
            console.log(
                "[SDK LOG] getOrders response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getOrders failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 買商品發動點：建立一筆新訂單 (進入待審核狀態)
     * - Schema: { userId: number, items: Array<{ packageName: string, quantity: number }> }
     * - Output: { success: true, data: { id, orderNo, userId, totalAmount, status: "PENDING", items: Array<{ packageId, unitPrice, subtotal, package: {} }> } }
     */
    async createOrder(userId, items) {
        try {
            const res = await apiClient.post("/createOrder", { userId, items });
            console.log(
                "[SDK LOG] createOrder response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createOrder failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 查詢指定會員的點數收支流水帳歷史紀錄
     * - Schema: { userId: number }
     * - Output: { success: true, data: Array<{ id, userId, points, type: "ACQUIRE"|"DEDUCT"|"EXPIRE"|"REFUND", description, createdAt }> }
     */
    async getPointTransactions(userId) {
        try {
            const res = await apiClient.post("/getPointTransactions", { userId });
            console.log(
                "[SDK LOG] getPointTransactions response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getPointTransactions failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    async getTicketsTransactions(userId) {
        try {
            const res = await apiClient.post("/getTicketsTransactions", { userId });
            console.log(
                "[SDK LOG] getTicketsTransactions response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getTicketsTransactions failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 查詢指定會員所持有的實體票券資產細項
     * - Schema: { userId: number }
     * - Output: { success: true, data: Array<{ id, userTicketId, totalQuantity, remainingQuantity, expiresAt, usages: [] }> }
     */
    async getUserTickets(userId) {
        try {
            const res = await apiClient.post("/getUserTickets", { userId });
            console.log(
                "[SDK LOG] getUserTickets response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getUserTickets failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 查詢個人單堂課程預約紀錄清單
     * - Schema: { userId(選填), page, pageSize }
     * - Output: { success: true, data: Array<{ id, courseId, userId, paymentMethod: "POINTS"|"TICKET", status: "BOOKED"|"CANCELLED", user: {}, participants: string[] }> }
     */
    async getBookings(payload = {}) {
        try {
            const res = await apiClient.post("/getBookings", payload);
            console.log(
                "[SDK LOG] getBookings response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getBookings failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 查詢個人期課/系列課程預約紀錄清單
     * - Schema: { userId(選填) }
     * - Output: { success: true, data: Array<{ id, seriesId, userId, paymentMethod, status }> }
     */
    async getSeriesBookingsList(payload = {}) {
        try {
            const res = await apiClient.post("/getSeriesBookingsList", payload);
            console.log(
                "[SDK LOG] getSeriesBookingsList response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getSeriesBookingsList failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 發動單堂預約 (含扣點與防超賣鎖定機制)
     * - Schema: { userId: number, courseId: number, paymentMethod: "POINTS"|"TICKET", product: string, companionIds: number[] }
     * - Output: { success: true, data: { id, courseId, userId, status: "BOOKED", pointTransactionId, participants: ["本人", "旅伴A"] } }
     */
    async createBooking(payload) {
        try {
            const res = await apiClient.post("/createBooking", payload);
            console.log(
                "[SDK LOG] createBooking response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createBooking failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 發動整期系列課程預約 (一次報名多堂)
     * - Schema: { userId: number, seriesId: number, paymentMethod: "POINTS"|"TICKET", product: string, companionIds: number[] }
     * - Output: { success: true, data: { id, seriesId, userId, paymentMethod, status: "BOOKED" } }
     */
    async createSeriesBooking(payload) {
        try {
            const res = await apiClient.post("/createSeriesBooking", payload);
            console.log(
                "[SDK LOG] createSeriesBooking response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createSeriesBooking failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 取消單堂預約 (發動退點/退券退償邏輯)
     * - Schema: { userId: number, bookingId: number }
     * - Output: { success: true, data: { id, status: "CANCELLED", participants: [] } }
     */
    async cancelBooking(userId, bookingId) {
        try {
            const res = await apiClient.post("/cancelBooking", { userId, bookingId });
            console.log(
                "[SDK LOG] cancelBooking response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] cancelBooking failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 取消整期課程預約
     * - Schema: { userId: number, seriesBookingId: number }
     * - Output: { success: true, data: { id, seriesId, status: "CANCELLED" } }
     */
    async cancelSeriesBooking(userId, seriesBookingId) {
        try {
            const res = await apiClient.post("/cancelSeriesBooking", {
                userId,
                seriesBookingId,
            });
            console.log(
                "[SDK LOG] cancelSeriesBooking response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] cancelSeriesBooking failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 修改老師基本履歷 (內部含 editableCheck 水平垂直權限深度安全檢查，防跨個體越權)
     * - Schema: { teacherId: number, name(選填), bio(選填), courseCategories: number[](選填) }
     * - Output: { success: true, data: { id, name, bio, user: { id, name, phone }, venues: [], courseCategories: [] } }
     */
    async updateTeacher(payload) {
        try {
            console.log('payload', payload)
            const res = await apiClient.post("/updateTeacher", payload);
            console.log(
                "[SDK LOG] updateTeacher response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateTeacher failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台建立/排定單堂課程 (預設狀態為 DRAFT)
     * - Schema: { courseCategory, courseType, teacher, venue, room, title, startTime, endTime, bookingStartTime,bookingEndTime,minCapacity, maxCapacity, paymentMethods: Array<{ paymentMethod, consumeValue, product }> }
     * - Output: { success: true, data: { id, title, status: "DRAFT", startTime, endTime, minCapacity, maxCapacity, paymentMethods: [] } }
     */
    async createCourse(payload) {
        try {
            const res = await apiClient.post("/createCourse", payload);
            console.log(
                "[SDK LOG] createCourse response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createCourse failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台建立週期性排課範本 (自動批次發動衍生子單堂課程)
     * - Schema: createCourseSchema 的基礎欄位聯集加上 { totalClasses, durationMinutes, schedulingType: "REGULAR", startDate, weeksCount, regularSchedules: Array<{ dayOfWeek(0-6), startTimeStr("HH:mm") }> }
     * - Output: { success: true, data: { id, title, status: "DRAFT", courses: Array<{ id, seriesSequence, startTime, endTime, status: "DRAFT" }> } }
     */
    async createCourseSeries(payload) {
        try {
            const res = await apiClient.post("/createCourseSeries", payload);
            console.log(
                "[SDK LOG] createCourseSeries response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createCourseSeries failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 更新課程設定與狀態切換 (發布、報名截止控管點)
     * - Schema: { courseId: number, courseCategory, courseType, teacher, venue, room, title, startTime, endTime, minCapacity, maxCapacity, paymentMethods: [], status: "DRAFT"|"PUBLISHED"|"BOOKING_CLOSED"|"CANCELLED"|"COMPLETED" (必填) }
     * - Output: { success: true, data: { id, title, status: "PUBLISHED", ... } }
     */
    async updateCourse(payload) {
        try {
            const res = await apiClient.post("/updateCourse", payload);
            console.log(
                "[SDK LOG] updateCourse response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateCourse failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /* ========================================================================
     * 🛡️ 3. 後台管理路由 (管理者 & 館主專屬)
     * 系統最高階之管理、場館、商品上架、資產審核發放端點
     * ======================================================================== */

    /**
     * 最高權限查詢全館所有使用者帳號明細
     * - Schema: emptySchema ({})
     * - Output: { success: true, data: Array<{ id, name, phone, birth, gender, isActive, roles: ["ADMIN","USER"], companions: [] }> }
     */
    async getUsersDetail() {
        try {
            const res = await apiClient.post("/getUsersDetail", {});
            console.log(
                "[SDK LOG] getUsersDetail response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getUsersDetail failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台新建場館
     * - Schema: { name: string, address: string, description: string }
     * - Output: { success: true, data: { id, name, address, description, isActive: true } }
     */
    async createVenue(name, address, description) {
        try {
            const res = await apiClient.post("/createVenue", {
                name,
                address,
                description,
            });
            console.log(
                "[SDK LOG] createVenue response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createVenue failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台修正場館資訊
     * - Schema: { venueId: number, name(選填), address(選填), description(選填), phone(選填) }
     * - Output: { success: true, data: { id, name, address, isActive: true, rooms: [] } }
     */
    async updateVenue(payload) {
        try {
            const res = await apiClient.post("/updateVenue", payload);
            console.log(
                "[SDK LOG] updateVenue response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateVenue failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 啟用指定場館
     * - Schema: { venueId: number }
     * - Output: { success: true, data: { id, name, isActive: true } }
     */
    async activeVenue(venueId) {
        try {
            const res = await apiClient.post("/activeVenue", { venueId });
            console.log(
                "[SDK LOG] activeVenue response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] activeVenue failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 停用指定場館 (軟下架控管)
     * - Schema: { venueId: number }
     * - Output: { success: true, data: { id, name, isActive: false } }
     */
    async deactiveVenue(venueId) {
        try {
            const res = await apiClient.post("/deactiveVenue", { venueId });
            console.log(
                "[SDK LOG] deactiveVenue response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] deactiveVenue failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    async assignVenueOwner(venueId, userId) {
        try {
            const res = await apiClient.post("/assignVenueOwner", { venueId, userId });
            console.log(
                "[SDK LOG] assignVenueOwner response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] assignVenueOwner failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 於指定場館內建置新教室房間
     * - Schema: { venue: string(場館名稱), name: string(房間號), maxCapacity: number }
     * - Output: { success: true, data: { id, venueId, name, maxCapacity, isActive: true, venueName } }
     */
    async createRoom(venue, name, maxCapacity) {
        try {
            const res = await apiClient.post("/createRoom", {
                venue,
                name,
                maxCapacity,
            });
            console.log(
                "[SDK LOG] createRoom response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createRoom failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 修正教室房間配置
     * - Schema: { roomId: number, name(選填), maxCapacity(選填), areaSize(選填) }
     * - Output: { success: true, data: { id, name, maxCapacity, isActive: true } }
     */
    async updateRoom(payload) {
        try {
            const res = await apiClient.post("/updateRoom", payload);
            console.log(
                "[SDK LOG] updateRoom response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateRoom failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 啟用教室房間
     * - Schema: { roomId: number }
     */
    async activeRoom(roomId) {
        try {
            const res = await apiClient.post("/activeRoom", { roomId });
            console.log(
                "[SDK LOG] activeRoom response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] activeRoom failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 停用教室房間
     * - Schema: { roomId: number }
     */
    async deactiveRoom(roomId) {
        try {
            const res = await apiClient.post("/deactiveRoom", { roomId });
            console.log(
                "[SDK LOG] deactiveRoom response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] deactiveRoom failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 上架全新的底層商品種類範本
     * - Schema: { name: string, description: string, productType: "POINTS"|"TICKET", packages: Array<packagePayloadSchema>(選填) }
     * - Output: { success: true, data: { id, name, productType, isActive: true, packages: [] } }
     */
    async createProduct(payload) {
        try {
            const res = await apiClient.post("/createProduct", payload);
            console.log(
                "[SDK LOG] createProduct response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createProduct failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 修正商品種類範本資訊
     * - Schema: { productId: number, name(選填), description(選填) }
     */
    async updateProduct(payload) {
        try {
            const res = await apiClient.post("/updateProduct", payload);
            console.log(
                "[SDK LOG] updateProduct response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateProduct failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 刪除商品主體範本
     * - Schema: { productId: number }
     */
    async deleteProduct(productId) {
        try {
            const res = await apiClient.post("/deleteProduct", { productId });
            console.log(
                "[SDK LOG] deleteProduct response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] deleteProduct failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 上架建置架上販售的規格包 (對齊綁定商品種類)
     * - Schema: { product: string(商品種類名稱), name: string(規格包名稱), expiryDays: number, quantity: number, price: number }
     * - Output: { success: true, data: { id, name, productId, expiryDays, quantity, price, isActive: true, product: {} } }
     */
    async createPackage(payload) {
        try {
            const res = await apiClient.post("/createPackage", payload);
            console.log(
                "[SDK LOG] createPackage response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createPackage failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 修正商品規格包配置與調整售價上下架狀態
     * - Schema: { packageId: number, expiryDays(選填), quantity(選填), price(選填), isActive(選填) }
     * - Output: { success: true, data: { id, name, price, isActive: false, product: {} } }
     */
    async updatePackage(payload) {
        try {
            const res = await apiClient.post("/updatePackage", payload);
            console.log(
                "[SDK LOG] updatePackage response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updatePackage failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 移除特定販售規格包
     * - Schema: { packageId: number }
     */
    async deletePackage(packageId) {
        try {
            const res = await apiClient.post("/deletePackage", { packageId });
            console.log(
                "[SDK LOG] deletePackage response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] deletePackage failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 核心資產核發發動點：審核通過訂單 (現收現金成功，正式發放點數/票券至會員名下)
     * - Schema: { orderNo: string }
     * - Output: { success: true, data: { id, orderNo, status: "APPROVE", reviewedBy: "1", reviewedAt: "2026-...", items: [...] } }
     */
    async approveOrder(orderNo) {
        try {
            const res = await apiClient.post("/approveOrder", { orderNo });
            console.log(
                "[SDK LOG] approveOrder response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] approveOrder failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 拒絕並作廢該筆待審核訂單
     * - Schema: { orderNo: string }
     * - Output: { success: true, data: { id, orderNo, status: "REJECTED", reviewedBy: "1", ... } }
     */
    async rejectOrder(orderNo) {
        try {
            const res = await apiClient.post("/rejectOrder", { orderNo });
            console.log(
                "[SDK LOG] rejectOrder response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] rejectOrder failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 取消並作廢該筆訂單
     * - Schema: { orderNo: string }
     */
    async cancelOrder(orderNo) {
        try {
            const res = await apiClient.post("/cancelOrder", { orderNo });
            console.log(
                "[SDK LOG] cancelOrder response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] cancelOrder failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 深度獲取所有授課師資清單與其關聯之 User 核心私隱帳號資料 (後台專用)
     * - Schema: emptySchema ({})
     * - Output: { success: true, data: Array<{ id, name, bio, venues: [], user: { id, name, phone, birth, gender } }> }
     */
    async getTeachersDetailWithUser() {
        try {
            const res = await apiClient.post("/getTeachersDetailWithUser", {});
            console.log(
                "[SDK LOG] getTeachersDetailWithUser response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getTeachersDetailWithUser failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台將現有 User 帳號綁定升級並核發「老師 (TEACHER)」身分職權
     * - Schema: { userId: number, name: string, bio: string }
     * - Output: { success: true, data: { id, name, bio, isActive: true, courseCategories: [], venues: [] } }
     */
    async createTeacher(userId, name, bio, image) {
        try {
            const res = await apiClient.post("/createTeacher", { userId, name, bio, image });
            console.log(
                "[SDK LOG] createTeacher response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createTeacher failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台指派、更動、覆蓋老師可授課的特定場館權責分工明細
     * - Schema: { teacherId: number, venues: number[](場館ID陣列) }
     * - Output: { success: true, data: { id, name, venues: ["覆蓋後的場館A", "覆蓋後的場館B"], user: {} } }
     */
    async assignTeacherVenues(teacherId, venues) {
        try {
            const res = await apiClient.post("/assignTeacherVenues", {
                teacherId,
                venues,
            });
            console.log(
                "[SDK LOG] assignTeacherVenues response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] assignTeacherVenues failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 解除並刪除特定老師身分紀錄
     * - Schema: { teacherId: number }
     */
    async deleteTeacher(teacherId) {
        try {
            const res = await apiClient.post("/deleteTeacher", { teacherId });
            console.log(
                "[SDK LOG] deleteTeacher response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] deleteTeacher failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台新增課程授課形式
     * - Schema: { name: string }
     */
    async createCourseType(name) {
        try {
            const res = await postCreateOption("/createCourseType", [
                { name },
                { title: name },
                { courseType: name },
                { type: name },
            ]);
            console.log(
                "[SDK LOG] createCourseType response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createCourseType failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 後台新增核心舞風分類
     * - Schema: { name: string }
     */
    async createCourseCategory(name) {
        try {
            const res = await postCreateOption("/createCourseCategory", [
                { name },
                { title: name },
                { courseCategory: name },
                { category: name },
                { style: name },
            ]);
            console.log(
                "[SDK LOG] createCourseCategory response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createCourseCategory failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 強制取消單堂排課 (發動因人數不足開班失敗或不可抗力主動取消之全額自動退補點/退券連鎖機制)
     * - Schema: { courseId: number }
     * - Output: { success: true }
     */
    async cancelCourse(courseId) {
        try {
            const res = await apiClient.post("/cancelCourse", { courseId });
            console.log(
                "[SDK LOG] cancelCourse response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] cancelCourse failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
     * 強制取消一整季/整組期課系列模板與其底下的排課
     * - Schema: { seriesId: number }
     */
    async cancelCourseSeries(seriesId) {
        try {
            const res = await apiClient.post("/cancelCourseSeries", { seriesId });
            console.log(
                "[SDK LOG] cancelCourseSeries response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] cancelCourseSeries failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    async getAnnouncements() {
        try {
            const res = await apiClient.post("/getAnnouncements");
            console.log(
                "[SDK LOG] getAnnouncements response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getAnnouncements failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    /**
     * 新重大通知
     * @param {Object} payload
     * - Schema: { title(string), content(/^09\d{8}$/), image(string), publishAt }
     */
    async createAnnouncement(payload) {
        try {
            const res = await apiClient.post("/createAnnouncement", payload);
            console.log(
                "[SDK LOG] createAnnouncement response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createAnnouncement failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    /**
     * 更新重大通知
     * @param {Object} payload
     * - Schema: { announcementId(number),title(string), content(/^09\d{8}$/), image(string), publishAt }
     */
    async updateAnnouncement(payload) {
        try {
            const res = await apiClient.post("/updateAnnouncement", payload);
            console.log(
                "[SDK LOG] updateAnnouncement response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateAnnouncement failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    // announcementId: number
    async publishAnnouncement(announcementId) {
        try {
            const res = await apiClient.post("/publishAnnouncement", {
                announcementId: announcementId
            });
            console.log(
                "[SDK LOG] publishAnnouncement response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] publishAnnouncement failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    async getActivityBanners() {
        try {
            const res = await apiClient.post("/getActivityBanners");
            console.log(
                "[SDK LOG] getActivityBanners response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] getActivityBanners failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    /**
     * 新增橫幅
     * @param {Object} payload
     * - Schema: { title(string), content(/^09\d{8}$/), image(string), publishAt, expiresAt, status(boolean) }
     */
    async createActivityBanner(payload) {
        try {
            const res = await apiClient.post("/createActivityBanner", payload);
            console.log(
                "[SDK LOG] createActivityBanner response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] createActivityBanner failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    /**
     * 更新橫幅
     * @param {Object} payload
     * - Schema: { bannerId(number),title(string), content(/^09\d{8}$/), image(string), publishAt, expiresAt, status(boolean) }
     */
    async updateActivityBanner(payload) {
        try {
            const res = await apiClient.post("/updateActivityBanner", payload);
            console.log(
                "[SDK LOG] updateActivityBanner response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] updateActivityBanner failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },
    // bannerId: number
    async deleteActivityBanner(bannerId) {
        try {
            const res = await apiClient.post("/deleteActivityBanner", {
                bannerId: bannerId
            });
            console.log(
                "[SDK LOG] deleteActivityBanner response:",
                JSON.stringify(res, null, 2)
            );
            return res;
        } catch (error) {
            console.error(
                "[SDK ERROR] deleteActivityBanner failed:",
                error.response?.data || error.message
            );
            throw error;
        }
    },

    /**
    * 上傳圖片至伺服器
    * @param {File} fileObject - 瀏覽器 <input type="file"> 或拖入事件取得的 File 物件
    * @returns {Promise<string>} 可用於資料庫儲存與 <img> 渲染的圖片絕對網址 URL
    */
    async uploadImage(fileObject, type) {
        try {
            // 1. 建立標準的 FormData 物件
            const formData = new FormData();
            formData.append('type', type);
            // 2. 關鍵：欄位名稱必須與後端 uploader.single("image") 規定的 "image" 完全一致
            formData.append('image', fileObject);

            // 3. 發送請求 (全 POST 架構且端點為 /api/uploadImage)
            const response = await axios.post(
                `${BASE_URL}/uploadImage`,
                formData,
                {
                    headers: {
                        // 帶入登入認證鎖頭
                        'Authorization': `Bearer ${tokens.accessToken}`
                        // 💡 註：此處千萬不可填寫 'Content-Type': 'multipart/form-data'，讓 Axios 自動組裝邊界值即可
                    }
                }
            );

            // 4. Log 紀錄並回傳與系統規範完美切合的通用外殼資料
            console.log('✅ [Axios Response] POST /api/uploadImage | Success:', response.data.success);

            // 回傳圖片的實體絕對路徑 URL (例如: http://localhost:3000/uploads/image-123.jpg)
            return response.data.data.imageUrl;

        } catch (error) {
            console.error('❌ [Axios Error] 圖片上傳失敗:', error.response?.data || error.message);
            throw error;
        }
    }
};

export { danceStudioSDK, danceStudioSDK as danceStudioSdk };

<template>
  <div>
    <h2>系統設定</h2>
    <h3>課表設定</h3>
    <div class="settingdiv">
      <div class="settingcon">
        <h4>開放預約預設值</h4>
        <p>
          會員端 (App及預約網站) 預設課程上架與開放預約時間
          <select v-model="selected">
            <option
              disabled
              value=""
            >
              請選擇
            </option>
            <option :value="{ text: 關閉上架/關閉預約 }">
              關閉上架/關閉預約
            </option>
            <option :value="{ text: 開放上架/關閉預約 }">
              開放上架/關閉預約
            </option>
            <option :value="{ text: 開放上架/開放預約 }">
              開放上架/開放預約
            </option>
          </select>
        </p>
        <p>
          課前多久上架至會員端
          <select v-model="selected">
            <option
              disabled
              value=""
            >
              請選擇
            </option>
            <option :value="{ number: 1 }">
              1
            </option>
            <option :value="{ number: 3 }">
              3
            </option>
            <option :value="{ number: 7 }">
              7
            </option>
            <option :value="{ number: 14 }">
              14
            </option>
            <option :value="{ number: 30 }">
              30
            </option>
          </select>
          日
        </p>
        <p>
          課前多久開放會員端預約
          <select v-model="selected">
            <option
              disabled
              value=""
            >
              請選擇
            </option>
            <option :value="{ number: 1 }">
              1
            </option>
            <option :value="{ number: 3 }">
              3
            </option>
            <option :value="{ number: 7 }">
              7
            </option>
            <option :value="{ number: 14 }">
              14
            </option>
            <option :value="{ number: 30 }">
              30
            </option>
          </select>
          日
        </p>
      </div>
      <div class="settingcon">
        <h4>會員端預約、取消預約規則</h4>
        <p>課前最晚自行預約時間 (預設值)</p>
        <input
          id="gs1"
          v-model="picked"
          type="radio"
          value="課程開始前都可預約"
        >
        <label for="1">課程開始前都可預約</label><br>
        <input
          id="gs2"
          v-model="picked"
          type="radio"
          value="課程結束前都可預約"
        >
        <label for="2">課程結束前都可預約</label><br>
        <input
          id="gs3"
          v-model="picked"
          type="radio"
          value="自訂課程前最晚預約時間"
        >
        <label for="3">自訂課程前最晚預約時間
          <select v-model="selected">
            <option
              disabled
              value=""
            >
              請選擇
            </option>
            <option :value="{ number: 30 }">
              30
            </option>
            <option :value="{ number: 60 }">
              60
            </option>
            <option :value="{ number: 120 }">
              120
            </option>
          </select>
          分鐘
        </label>
        <p>
          課前最晚自行取消預約時間 (預設值) 
          <select v-model="selected">
            <option
              disabled
              value=""
            >
              請選擇
            </option>
            <option :value="{ number: 30 }">
              30
            </option>
            <option :value="{ number: 60 }">
              60
            </option>
            <option :value="{ number: 120 }">
              120
            </option>
          </select>
          分鐘
        </p>
      </div>
      <div class="settingcon">
        <h4>重複課程預設值</h4>
        <p>建立重複課程時，第二堂課以後的建立規則。</p>
        <span>設定值包含：後台開放預約時間/會員端上架時間/會員端開放預約時間</span><br>
        <div class="setting-pic">
          <input
            id="gs4"
            v-model="picked"
            type="radio"
            value="與第一堂沿用相同規則"
          >
          <label for="4">與第一堂沿用相同規則<br><span>例：3/2 第一堂課，2/23 開放預約；3/9 第二堂課，3/2 開放預約</span></label><br>
        </div>
        <div class="setting-pic">
          <input
            id="gs5"
            v-model="picked"
            type="radio"
            value="與第一堂設置完全相同"
          >
          <label for="5">與第一堂設置完全相同<br><span>第一堂設置7天前 (3/2) 開放預約，後續課程都是 3/2 開放預約</span></label>
        </div>
      </div>
      <div class="settingcon">
        <h4>團體課最低開課人數預設值</h4>
        <p>提示報名人數未達標</p>
        <ul>
          <li><span>未達開課人數的課程，將在團體課表顯示橘色 [未] 提示</span></li>
          <li><span>啟用本功能，可設定未達標課程自動停課（需先開通「自動停課」進階模組）</span></li>
        </ul>
        <p>
          最低開課人數（預設值）
          <input v-model="message">
          人
        </p>
        <p>
          距今幾天內的課提示未達標
          <select v-model="selected">
            <option
              disabled
              value=""
            >
              請選擇
            </option>
            <option :value="{ number: 1 }">
              1
            </option>
            <option :value="{ number: 2 }">
              2
            </option>
            <option :value="{ number: 3 }">
              3
            </option>
            <option :value="{ number: 4 }">
              4
            </option>
            <option :value="{ number: 5 }">
              5
            </option>
          </select>
          天內
        </p>
        <p>後台顯示未達標通知卡 {{ SystemClassNotice }}</p>
        <input
          id="everyday"
          v-model="SystemClassNotice"
          type="checkbox"
          value="everyday"
        >
        <label for="everyday">每天 </label><input
          v-model="message"
          type="time"
        >

        <input
          id="second"
          v-model="SystemClassNotice"
          type="checkbox"
          value="second"
        >
        <label for="second">第二次提醒 </label><input
          v-model="message"
          type="time"
        >
      </div>
      <div class="settingcon">
        <h4>
          品牌App課程圖片顯示設定
          <select v-model="selected">
            <option
              disabled
              value=""
            >
              請選擇
            </option>
            <option :value="{ number: classimg }">
              根據課程顯示圖片
            </option>
            <option :value="{ number: teacherimg }">
              根據老師顯示圖片
            </option>
          </select>
        </h4>
      </div>
    </div>
    <h3>一般設定</h3>
    <div class="settingdiv">
      <h4>自動化停權設定</h4>
      <p>
        <input
          id="Suspension"
          v-model="Suspension"
          type="checkbox"
          value="Suspension"
        >自動將多次未到課會員停權
      </p>
      <h4>儲值票券預設值</h4>
      <p>票券預設有效期限： {{ TicketTerm }} <input v-model="TicketTerm"> 天</p>
      <p>
        票券預設啟用方式： 
        <select v-model="selected">
          <option
            disabled
            value=""
          >
            請選擇
          </option>
          <option :value="{ text: 首次上課當日啟用 }">
            首次上課當日啟用
          </option>
          <option :value="{ number: 購買當日啟用 }">
            購買當日啟用
          </option>
        </select>
      </p>
    </div>
    <h3>提醒設定</h3>
    <div class="settingdiv">
      <h4>管理者 Email{{ Email }} </h4>
      <p><input v-model="Email"></p><br>
      <h4>提醒清單</h4>
      <p>發生以下事件時，自動寄送提醒給管理者。</p>
      <div class="setting-pic">
        <p>
          <input
            id="Neworder"
            v-model="Neworder"
            type="checkbox"
            value="Neworder"
          >後台成立新訂單 (票券/通行卡/分鐘計費卡)
        </p>
        <span>將寄給會員的「購買成功通知信」也轉寄給管理者，如有啟用<a href="#">電子合約功能</a>，信內將夾帶合約</span>
      </div>
      <div class="setting-pic">
        <p>
          <input
            id="Newecoorder"
            v-model="Newecoorder"
            type="checkbox"
            value="Newecoorder"
          >品牌電商成立新訂單 (票券/通行卡/分鐘計費卡/期班/線上課程)
        </p>
        <span>將寄給會員的「購買成功通知信」也轉寄給管理者，如有啟用<a href="#">電子合約功能</a>，信內將夾帶合約</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
    name: 'BaslineGeneralsetting',
};
</script>

<script setup>
import { ref } from 'vue'
const picked = ref('1')
</script>

<style scoped>
h3{
  margin: 15px 0;
  font-size:18px;
  font-weight:500;
}
.settingcon{
  margin:10px 0;
}
.setting-pic{
  text-indent:-20px;
  margin-left:20px
}
h4{
  line-height:150%;
  margin:0 0 5px;
  color: #494949;
  font-weight:500;
}
p{
  font-size:15px;
  line-height:185%;
  color: #494949;
  margin:0;
}
span{
  font-size:15px;
  line-height:185%;
  color: #49494980;
  margin:0;
}
</style>
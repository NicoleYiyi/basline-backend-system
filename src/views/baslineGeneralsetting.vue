<template>
    <div>
      <h2>系統設定</h2>
      <h3>課表設定</h3>
      <div class="settingdiv">
        <div class="settingcon">
          <h4>開放預約預設值</h4>
          <p>會員端 (App及預約網站) 預設課程上架與開放預約時間
            <select v-model="selected">
              <option disabled value="">請選擇</option>
              <option :value="{ text: 關閉上架/關閉預約 }">關閉上架/關閉預約</option>
              <option :value="{ text: 開放上架/關閉預約 }">開放上架/關閉預約</option>
              <option :value="{ text: 開放上架/開放預約 }">開放上架/開放預約</option>
            </select>
          </p>
          <p>課前多久上架至會員端
            <select v-model="selected">
              <option disabled value="">請選擇</option>
              <option :value="{ number: 1 }">1</option>
              <option :value="{ number: 3 }">3</option>
              <option :value="{ number: 7 }">7</option>
              <option :value="{ number: 14 }">14</option>
              <option :value="{ number: 30 }">30</option>
            </select>
          日</p>
          <p>課前多久開放會員端預約
            <select v-model="selected">
              <option disabled value="">請選擇</option>
              <option :value="{ number: 1 }">1</option>
              <option :value="{ number: 3 }">3</option>
              <option :value="{ number: 7 }">7</option>
              <option :value="{ number: 14 }">14</option>
              <option :value="{ number: 30 }">30</option>
            </select>
          日</p>
        </div>
        <div class="settingcon">
          <h4>會員端預約、取消預約規則</h4>
          <p>課前最晚自行預約時間 (預設值)</p>
          <input type="radio" id="gs1" value="課程開始前都可預約" v-model="picked" />
          <label for="1">課程開始前都可預約</label><br>
          <input type="radio" id="gs2" value="課程結束前都可預約" v-model="picked" />
          <label for="2">課程結束前都可預約</label><br>
          <input type="radio" id="gs3" value="自訂課程前最晚預約時間" v-model="picked" />
          <label for="3">自訂課程前最晚預約時間</label>
          <p>課前最晚自行取消預約時間 (預設值) </p>
        </div>
        <div class="settingcon">
          <h4>重複課程預設值</h4>
          <p>建立重複課程時，第二堂課以後的建立規則。</p>
          <span>設定值包含：後台開放預約時間/會員端上架時間/會員端開放預約時間</span>
        </div>
        <div class="settingcon">
          <h4>團體課最低開課人數預設值</h4>
          <p>提示報名人數未達標</p>
          <ul>
            <li><span>未達開課人數的課程，將在團體課表顯示橘色 [未] 提示</span></li>
            <li><span>啟用本功能，可設定未達標課程自動停課（需先開通「自動停課」進階模組）</span></li>
          </ul>
          <p>最低開課人數（預設值）</p>
          <p>距今幾天內的課提示未達標</p>
          <p>後台顯示未達標通知卡</p>
        </div>
        <div class="settingcon">
          <h4>品牌App課程圖片顯示設定</h4>
        </div>
      </div>
      <div class="settingdiv">
        <h3>點數設定</h3>
      </div>
      <div class="settingdiv">
        <h3>一般設定</h3>
      </div>
      <div class="settingdiv">
        <h3>提醒設定</h3>
      </div>
    </div>
</template>

<script>
export default {
    name: 'baslineGeneralsetting',
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
<template>
    <div>
      <h2>銷售明細</h2>
      <button class="addbtn" @click="showPopup = true">新增商品</button>
      <BaslinePopup v-model="showPopup">
        <h3>新增商品</h3>
        <h5>商品名稱： {{ message }}<input v-model="message" placeholder="商品名稱" /></h5>
        <h5>商品類型：
        <select v-model="selected">
            <option disabled value="">請選擇</option>
            <option :value="{ text: 點數方案 }">點數方案</option>
            <option :value="{ text: 期課 }">期課</option>
            <option :value="{ text: 私課 }">私課</option>
            <option :value="{ text: 樂享券請款 }">樂享券請款</option>        </select></h5>
        <h5>圖片：<input id="classimgupload" type="file" @change="onFileChange" accept="image/*" /></h5>
        <div v-if="previewUrl" class="preview">
            <h5>圖片預覽：</h5>
            <img :src="previewUrl" alt="預覽圖片" style="max-width: 300px;" />
        </div>
        <h5>價格： {{ message }}<input v-model="message" placeholder="商品價格" /> 元</h5>
      </BaslinePopup>
      <table>
        <tr>
            <th><h4>圖片</h4></th>
            <th><h4>商品名稱</h4></th>
            <th><h4>商品類型</h4></th>
            <th><h4>商品內容</h4></th>
        </tr>
        <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
        </tr>
      </table>
    </div>
</template>

<script>
export default {
    name: 'baslineSalesmanagement',
};
</script>

<script setup>
import { ref } from 'vue'
import BaslinePopup from '@/components/baslinePopup.vue';

const showPopup = ref(false)
const previewUrl = ref(null)

function onFileChange(event) {
  const file = event.target.files[0]
  if (file && file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  } else {
    previewUrl.value = null
    alert('請上傳圖片格式的檔案')
  }
}
</script>

<style scoped>
th,td{
    width:25%;
    text-align:left;
    padding:5px;
}
th{
    background-color:#252525;
}
h4{
    margin:0;
    color:#fff;
}
</style>
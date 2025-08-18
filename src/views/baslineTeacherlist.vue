<template>
    <div>
      <h2>教師清單</h2>
      <button class="addbtn" @click="showPopup = true">新增教師</button>
      <BaslinePopup v-model="showPopup">
        <h3>新增教師</h3>
        <h5>教師名稱： {{ message }}<input v-model="message" placeholder="課程名稱" /></h5>
        <h5>圖片：<input id="classimgupload" type="file" @change="onFileChange" accept="image/*" /></h5>
        <div v-if="previewUrl" class="preview">
            <h5>圖片預覽：</h5>
            <img :src="previewUrl" alt="預覽圖片" style="max-width: 300px;" />
        </div>
        <h5>教師介紹：</h5>
        <p style="white-space: pre-line;">{{ message }}
        <textarea v-model="message" placeholder="教師介紹"></textarea></p>
      </BaslinePopup>
      <table>
        <tr>
            <th><h4>圖片</h4></th>
            <th><h4>教師名稱</h4></th>
            <th><h4>授課類型</h4></th>
            <th><h4>會員端顯示</h4></th>
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
    name: 'baslineTeacherlist',
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
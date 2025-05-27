<template>
    <div>
      <h2>團體課表</h2>
      <button class="addbtn">新增課程</button>
      <table>
        <tr>
            <th><h4>圖片</h4></th>
            <th><h4>課程名稱</h4></th>
            <th><h4>課程類型</h4></th>
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
    name: 'baslineGroupclass',
};
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
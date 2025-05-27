<template>
    <div>
      <h2>會館設定</h2>
      <button class="addbtn">新增會館</button>
      <table>
        <tr>
            <th><h4>圖片</h4></th>
            <th><h4>會館名稱</h4></th>
        </tr>
        <tr>
            <td>1</td>
            <td>2</td>
        </tr>
      </table>
    </div>
</template>

<script>
export default {
    name: 'baslineVenuesetting',
};
</script>

<style scoped>
th,td{
    width:50%;
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
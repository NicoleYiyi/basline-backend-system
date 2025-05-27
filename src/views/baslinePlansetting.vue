<template>
    <div>
      <h2>方案設定</h2>
      <button class="addbtn">新增票券</button>
      <table>
        <tr>
            <th><h4>編號</h4></th>
            <th><h4>票券名稱</h4></th>
            <th><h4>儲值類型</h4></th>
        </tr>
        <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
        </tr>
      </table>
    </div>
</template>

<script>
export default {
    name: 'baslinePlansetting',
};
</script>

<style scoped>
th,td{
    width:33.3%;
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
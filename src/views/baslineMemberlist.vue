<template>
    <div>
      <h2>會員清單</h2>
      <button class="addbtn">新增會員</button>
      <table>
        <tr>
            <th><h4>會員帳號</h4></th>
            <th><h4>姓名</h4></th>
            <th><h4>最新儲值</h4></th>
            <th><h4>最近預約</h4></th>
            <th><h4>註冊日期</h4></th>
        </tr>
        <tr>
            <td>1</td>
            <td>2</td>
            <td>3</td>
            <td>4</td>
            <td>5</td>
        </tr>
      </table>
    </div>
</template>

<script>
export default {
    name: 'baslineMemberlist',
};
</script>

<style scoped>
th,td{
    width:20%;
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
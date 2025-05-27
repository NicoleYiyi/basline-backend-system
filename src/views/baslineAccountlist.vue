<template>
    <div>
      <h2>員工帳號</h2>
      <button class="addbtn">新增員工</button>
      <table>
        <tr>
            <th><h4>員工</h4></th>
            <th><h4>帳號</h4></th>
            <th><h4>所屬平台</h4></th>
            <th><h4>所屬會館</h4></th>
            <th><h4>角色</h4></th>
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
    name: 'baslineAccountlist',
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
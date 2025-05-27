<template>
    <div>
      <h2>角色與權限管理</h2>
      <button class="addbtn">新增角色</button>
      <table>
        <tr>
            <th><h4>角色名稱</h4></th>
            <th><h4>所屬平台</h4></th>
            <th><h4>權限內容</h4></th>
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
    name: 'baslinePermissionmanagement',
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
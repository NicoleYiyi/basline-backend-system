<template>
    <div>
      <h2>教室清單</h2>
      <button class="addbtn">新增教室</button>
      <table>
        <tr>
            <th><h4>教室名稱</h4></th>
            <th><h4>所屬會館</h4></th>
            <th><h4>可容納名額</h4></th>
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
    name: 'baslineClassroomlist',
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
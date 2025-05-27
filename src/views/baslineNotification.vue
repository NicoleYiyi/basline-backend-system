<template>
    <div>
      <h2>活動清單</h2>
      <button class="addbtn">新增通知</button>
      <table>
        <tr>
            <th><h4>主題</h4></th>
            <th><h4>通知內容</h4></th>
            <th><h4>發送時間</h4></th>
            <th><h4>發送狀態</h4></th>
            <th><h4>發送渠道</h4></th>
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
    name: 'baslineNotification',
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
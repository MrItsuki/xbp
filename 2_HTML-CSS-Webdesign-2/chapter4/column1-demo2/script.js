const data = {
  labels: ["4月", "5月", "6月", "7月"],
  datasets: [
      {
          values: [68, 74, 70, 81]
      }
  ]
}
const chart = new frappe.Chart("#chart", {
  title: "数学 テスト結果",
  data: data,
  type: 'line'
})
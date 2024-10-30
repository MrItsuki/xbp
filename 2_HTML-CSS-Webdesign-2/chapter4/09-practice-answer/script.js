var pieData = {
  labels: ['猫', '犬', 'きりん', 'その他'],
  series: [35, 30, 20, 15]
};

var pieOptions = {
  width: '100%',
  height: '300px'
};

new Chartist.Pie('.animal-chart', pieData, pieOptions);
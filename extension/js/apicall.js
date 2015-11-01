<!DOCTYPE HTML>
<html>
<head>
<script>
function myFunction()
{
	$.getJSON('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro=&explaintext=&titles=Stack%20Overflow', function(data) {
  alert(data.name);
});
	alert(“Hello World!”)
}
</script>
</head>
<body>
</body>
</html>
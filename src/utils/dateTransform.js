function dateTransform(str, ts) {
  const date = new Date(ts);
  const newStr = str
    .replace("y", date.getFullYear())
    .replace(
      "m",
      date.getMonth() + 1 >= 10
        ? date.getMonth() + 1
        : "0" + (date.getMonth() + 1)
    )
    .replace("d", date.getDate() >= 10 ? date.getDate() : "0" + date.getDate())
    .replace(
      "h",
      date.getHours() >= 10 ? date.getHours() : "0" + date.getHours()
    )
    .replace(
      "i",
      date.getMinutes() >= 10 ? date.getMinutes() : "0" + date.getMinutes()
    )
    .replace(
      "s",
      date.getSeconds() >= 10 ? date.getSeconds() : "0" + date.getSeconds()
    );
  console.log(newStr);
  return newStr;
}

export default dateTransform;

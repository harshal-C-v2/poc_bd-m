exports.getQueryStringFromObject = (object) => {
  const objKeys = Object.keys(object);
  let newQuery = "";
  objKeys.forEach((key, index) => {
    if (key !== "id") newQuery += `${key} = '${object[key]}' ${index != objKeys.length - 1 ? ", " : ""}`;
  });

  return newQuery;
};

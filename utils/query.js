module.exports = {
  getPaginationValues: (pageNum, pageSize) => [
    (pageNum - 1) * pageSize,
    Number(pageSize),
  ],
}

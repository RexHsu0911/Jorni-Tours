const getOffset = (page = 1, limit = 10) => (page - 1) * limit

const getPagination = (page = 1, limit = 10, total = 50) => {
  const totalPage = Math.ceil(total / limit) // Math.ceil 無條件進位
  const pages = Array.from({ length: totalPage }, (_, index) => index + 1)
  const currentPage = page < 1 ? 1 : page > totalPage ? totalPage : page
  const prev = currentPage - 1 < 1 ? 1 : currentPage - 1
  const next = currentPage + 1 > totalPage ? totalPage : currentPage + 1

  return {
    totalPage,
    pages,
    currentPage,
    prev,
    next
  }
}

module.exports = {
  getOffset,
  getPagination
}

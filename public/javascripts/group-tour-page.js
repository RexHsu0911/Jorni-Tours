// onchange input
function calculateTotal () {
  const quantity = parseInt(document.getElementById('count').value)
  const price = parseInt(document.getElementById('groupTourPrice').innerText)

  const subTotal = price * quantity

  // 有選擇數量，顯示總金額
  if (quantity) {
    document.getElementById('total').innerText = 'Total： '
    document.getElementById('subTotal').innerText = 'TWD' + subTotal
  } else {
    document.getElementById('total').innerText = ''
    document.getElementById('subTotal').innerText = ''
  }
}

// onclick +
function incrementCount () {
  const countInput = document.getElementById('count')
  const inventory = document.getElementById('inventory')

  // 選擇數量 < 庫存
  if (countInput.value < inventory.value) {
    countInput.value++
    return calculateTotal()
  }
}

// onclick -
function decrementCount () {
  const countInput = document.getElementById('count')
  if (countInput.value > 1) {
    countInput.value--
  } else {
    // 設為空字串，顯示 placeholder="0"
    countInput.value = ''
  }

  return calculateTotal()
}

// onclick reset
function resetCount () {
  // 設為空字串，顯示 placeholder="0"
  document.getElementById('count').value = ''
  return calculateTotal()
}

function switchForm () {
  // 切換表單的 action 和 method
  document.getElementById('cartForm').action = '/order'
  document.getElementById('cartForm').method = 'GET'
}

module.exports = {
  calculateTotal,
  incrementCount,
  decrementCount,
  resetCount,
  switchForm
}

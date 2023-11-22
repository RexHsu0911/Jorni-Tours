// onchange input
function calculateTotal () {
  const quantity = parseInt(document.getElementById('count').value)
  const price = parseInt(document.getElementById('groupTourPrice').innerText)

  const subTotal = price * quantity

  if (quantity) {
    document.getElementById('subTotal').innerText = 'TWD' + subTotal
  } else {
    document.getElementById('subTotal').innerText = ''
  }
}

// onclick +
function incrementCount () {
  const countInput = document.getElementById('count')
  if (countInput.value < 20) {
    countInput.value++
    return calculateTotal()
  }
}

// onclick -
function decrementCount () {
  const countInput = document.getElementById('count')
  if (countInput.value > 0) {
    countInput.value--
    return calculateTotal()
  }
}

// onclick reset
function resetCount () {
  document.getElementById('count').value = 0
  return calculateTotal()
}

module.exports = {
  calculateTotal,
  incrementCount,
  decrementCount,
  resetCount
}

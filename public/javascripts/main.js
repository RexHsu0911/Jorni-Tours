// group-tour page
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
  if (countInput.value < 30) {
    countInput.value++
    calculateTotal()
  }
}

// onclick -
function decrementCount () {
  const countInput = document.getElementById('count')
  if (countInput.value > 0) {
    countInput.value--
    calculateTotal()
  }
}

// onclick reset
function resetCount () {
  document.getElementById('count').value = 0
  calculateTotal()
}

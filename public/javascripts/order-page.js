// onsubmit forms
function submitForms () {
  const paymentForm = document.getElementById('paymentForm')
  const orderForm = document.getElementById('orderForm')

  // 取得 FormData
  const paymentFormData = new FormData(paymentForm)
  const orderFormData = new FormData(orderForm)

  // fetch API 非同步提交表單
  fetch('order', {
    method: 'POST',
    body: orderFormData
  })

  fetch('payment', {
    method: 'POST',
    body: paymentFormData
  })
}

module.exports = submitForms

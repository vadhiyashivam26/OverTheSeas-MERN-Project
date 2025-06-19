(() => {
  'use strict'

  // Fetch all the forms we want to apply custom Bootstrap validation styles to
  const forms = document.querySelectorAll('.needs-validation')

  // Loop over them and prevent submission
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault()
        event.stopPropagation()
      }

      form.classList.add('was-validated')
    }, false)
  })
})()

// index page taxes feature

const taxSwitch = document.querySelector("#switchCheckDefault");

taxSwitch.addEventListener("change", () => {
  const beforeTaxes = document.querySelectorAll(".before-taxes");
  const afterTaxes = document.querySelectorAll(".after-taxes");

  beforeTaxes.forEach(el => el.style.display = taxSwitch.checked ? "none" : "inline");
  afterTaxes.forEach(el => el.style.display = taxSwitch.checked ? "inline" : "none");
});

// Initially hide after-tax prices
window.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".after-taxes").forEach(el => el.style.display = "none");
});
const sweetCandies = {
  customClass: "sweetClass",
  showClass: {
    popup: `
      animate__animated
      animate__fadeInUp
      animate__faster
      `
  },
  hideClass: {
    popup: `
      animate__animated
      animate__fadeOutUp
      animate__faster
      `
  },
  allowOutsideClick() {
    return false;
  }
}
async function showResult(title, message, icon, json = {}, result = () => {}) {
  const iconn = icon ? icon.toLowerCase() : "";
  Swal.fire({
    title: title,
    html: message,
    icon: iconn,
    confirmButtonColor: "rebeccapurple",
    showCancelButton: false,
    cancelButtonColor: "#d33",
    confirmButtonText: "Okay",
    heightAuto: false,
    ...sweetCandies,
    ...json
  }).then(result);
}
async function showLoading(message, willClose) {
  const random = Math.floor(Math.random());
  const dialog = Swal.fire({
    html: `<div class='${random}'>${message}</div>`,
    allowEscapeKey: false,
    showConfirmButton: !willClose,
    willOpen() {
      Swal.showLoading();
    },
    ...sweetCandies
  });
  return (successMessage, callback = () => {}) => {
    setTimeout(() => {
      dialog.hideLoading();
      $(`.${random}`).html(successMessage);
      if (willClose) setTimeout(() => {
        dialog.close();
        callback();
      }, 2 * 1000);
    }, 1 * 1000);
  };
}

const number = document.getElementById('number');
const seconds = document.getElementById('seconds');
const button = document.getElementById('submit-button');
async function Neth() {
  const numberValue = number.value;
  const secondsValue = seconds.value;
  if (!(numberValue && !isNaN(numberValue)) || !(secondsValue && !isNaN(secondsValue))) {
    return showResult('', 'Enter a valid phone number and seconds limit.', '');
  }
    const dialog_ = await showLoading("Please wait...", true);
    try {
      const login = await axios.get(`/bomb?number=${numberValue}&seconds=${secondsValue}`);
      const result = login.data;
      if (result.error) throw new Error(result?.error || "Something went wrong");
      return dialog_("Success!", () => {
        showResult("SMS Bomber", `TARGET NUMBER ${numberValue} SPAMMED SUCCESSGULLY FOR ${secondsValue} seconds.`, "success", {}, (result) => result.isConfirmed ? window.location.reload() : null);
      });
    } catch (error) {
      return showResult("Error!", error.message || error, "error");
    }
}
addEventListener("DOMContentLoaded", async () => {
  [number, seconds].forEach(name => {
    name.value = localStorage.getItem(name.id) || "";
    name.addEventListener("input", () => {
      localStorage.setItem(name.id, name.value);
    });
  });
  button.onclick = Neth;
});
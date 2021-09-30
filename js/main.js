const right = document.querySelector(".right");
const checkboxes = document.querySelector(".checkboxes");
const count = document.querySelector(".count");
const employeesTableBody = document.querySelector(".employees-table tbody");
const select = document.querySelector("#sort-by");
let roles;
let employees;
let sortedData;
let checkbox;

fetch("http://localhost:3000/roles")
  .then((res) => res.json())
  .then((res) => {
    createCheckboxes(res);
    roles = [...res];
  });

fetch("http://localhost:3000/employees")
  .then((res) => res.json())
  .then((res) => {
    employees = [...res];
    sortedData = employees;
    createTable(sortBy(sortedData, true, "name"));
  });

function createCheckboxes(data) {
  checkboxes.innerHTML = "<h3>Filter by roles<h3>";

  for (let i = 0; i < data.length; i++) {
    checkboxes.innerHTML += `<p><input type="checkbox" id="${data[i].id}" value="${data[i].id}">${data[i].name}</p>`;
  }

  checkbox = document.querySelectorAll("input[type=checkbox]");
}

function createTable() {
  if (sortedData.length == 0) {
    sortedData = employees;
  }

  count.innerText = sortedData.length;
  employeesTableBody.innerHTML = "";

  for (let i = 0; i < sortedData.length; i++) {
    employeesTableBody.insertRow().innerHTML = `<td>${
      sortedData[i].id
    }</td><td>${sortedData[i].name}</td><td>${
      roles[sortedData[i].role_id - 1].name
    }</td><td>${sortedData[i].salary}</td>`;
  }

  createBarChart(sortedData);
}

function sortBy(data, asc, attr) {
  if (asc) {
    sortedData = data.sort((a, b) => {
      if (a[attr] > b[attr]) {
        return 1;
      }
      if (a[attr] < b[attr]) {
        return -1;
      }
      return 0;
    });
  } else {
    sortedData = data.sort((a, b) => {
      if (b[attr] > a[attr]) {
        return 1;
      }
      if (b[attr] < a[attr]) {
        return -1;
      }
      return 0;
    });
  }
  return sortedData;
}

function selectedSort() {
  const index = select.options.selectedIndex;

  if (sortedData.length == 0) {
    sortedData = employees;
  }
  if (index == 0) {
    createTable(sortBy(sortedData, true, "name"));
  } else if (index == 1) {
    createTable(sortBy(sortedData, false, "name"));
  } else if (index == 2) {
    createTable(sortBy(sortedData, true, "salary"));
  } else if (index == 3) {
    createTable(sortBy(sortedData, false, "salary"));
  }
}

function filterBy() {
  let filteredData = [];
  let options = [];
  checkbox.forEach((el) => {
    if (el.checked) {
      options.push(el.value);
    }
  });

  for (let i = 0; i < options.length; i++) {
    employees.map((el) => {
      if (el.role_id == options[i]) {
        filteredData.push(el);
      }
    });
  }
  sortedData = filteredData;
  createTable(selectedSort());
}

select.addEventListener("change", selectedSort);
checkboxes.addEventListener("change", filterBy);

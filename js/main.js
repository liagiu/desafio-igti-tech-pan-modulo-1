const right = document.querySelector(".right");
const checkboxes = document.querySelector(".checkboxes");
const count = document.querySelector(".count");
const employeesTableBody = document.querySelector(".employees-table tbody");
const select = document.querySelector("#sort-by");
const barChart = document.querySelector(".bar-chart");
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

function createBarChart() {
  barChart.innerHTML = "";
  const height = barChart.offsetHeight;
  const width = barChart.offsetWidth;
  const marginY = height * 0.05;
  const marginX = width * 0.05;
  const countInt = parseInt(count.innerText);
  const groupedBySalary = d3
    .nest()
    .key(function (d) {
      return d.salary;
    })
    .entries(sortBy(sortedData, true, "salary"));

  const yScale = d3
    .scaleLinear()
    .range([height * 0.85, 0])
    .domain([0, 100]);

  const xScale = d3
    .scaleBand()
    .range([0, width * 0.9])
    .domain(groupedBySalary.map((d) => d.key))
    .padding(0.5);

  const chart = d3
    .select(".bar-chart")
    .append("svg")
    .attr("width", 100 + "%")
    .attr("height", 100 + "%");

  chart
    .append("g")
    .attr("transform", `translate(${marginX},${marginY})`)
    .call(d3.axisLeft(yScale))
    .append("g")
    .attr("transform", `translate(0, ${height * 0.85})`);

  chart
    .append("g")
    .attr("transform", `translate(${width * 0.05}, ${height * 0.9})`)
    .call(d3.axisBottom(xScale))
    .selectAll(".tick text")
    .attr("font-size", 0.45 + "rem")
    .call(wrap, width * 0.05);

  chart
    .append("g")
    .attr("transform", `translate(${marginX},${marginY})`)
    .selectAll()
    .data(groupedBySalary)
    .enter()
    .append("rect")
    .attr("x", (d) => xScale(d.key))
    .attr("y", (d) => yScale((d.values.length / countInt) * 100))
    .attr(
      "height",
      (d) => yScale(0) - yScale((d.values.length / countInt) * 100)
    )
    .attr("width", xScale.bandwidth());
}

function wrap(text, width) {
  text.each(function () {
    var text = d3.select(this),
      words = text.text().split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = 1.1, // ems
      y = text.attr("y"),
      dy = parseFloat(text.attr("dy")),
      tspan = text
        .text(null)
        .append("tspan")
        .attr("x", 0)
        .attr("y", y)
        .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", 0)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

select.addEventListener("change", selectedSort);
checkboxes.addEventListener("change", filterBy);

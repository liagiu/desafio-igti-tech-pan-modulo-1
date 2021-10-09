const right = document.querySelector(".right");
const checkboxes = document.querySelector(".checkboxes");
const count = document.querySelector(".count");
const employeesTableBody = document.querySelector(".employees-table tbody");
const select = document.querySelector("#sort-by");
const barChart = document.querySelector(".bar-chart");
const pieChart = document.querySelector(".pie-chart");
const barLink = document.querySelector(".bar-chart-link");
const pieLink = document.querySelector(".pie-chart-link");
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

  data.sort((a, b) => d3.ascending(a.name, b.name));

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
  createBarChart();
  createPieChart();
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
    .entries(
      sortedData.slice().sort((a, b) => d3.ascending(a.salary, b.salary))
    );

  const yScale = d3
    .scaleLinear()
    .range([height * 0.8, 0])
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

  const tooltip = d3.select(".tooltip");

  chart
    .append("g")
    .attr("transform", `translate(${marginX},${marginY})`)
    .call(d3.axisLeft(yScale))
    .append("g")
    .attr("transform", `translate(0, ${height * 0.8})`);

  chart
    .append("g")
    .attr("transform", `translate(${width * 0.05}, ${height * 0.85})`)
    .call(d3.axisBottom(xScale))
    .selectAll(".tick text")
    .attr("font-size", 0.45 + "rem");

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

  chart
    .selectAll("rect")
    .on("mouseover", function (d) {
      tooltip
        .html(
          `${d.values.length} (${((d.values.length / countInt) * 100).toFixed(
            1
          )}%)`
        )
        .style("opacity", 1)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 33 + "px");
    })
    .on("mouseleave", (d) => {
      tooltip.style("opacity", 0);
    });

  chart
    .append("text")
    .attr("x", -(height / 2) + marginY)
    .attr("y", width * 0.015)
    .attr("transform", "rotate(-90)")
    .attr("text-anchor", "middle")
    .text("Employees (%)")
    .attr("font-size", 0.85 + "rem");

  chart
    .append("text")
    .attr("x", width / 2)
    .attr("y", height * 0.98)
    .attr("text-anchor", "middle")
    .text("Salaries ($)")
    .attr("font-size", 0.85 + "rem");
}

function createPieChart() {
  pieChart.innerHTML = "";
  const height = pieChart.offsetHeight;
  const width = pieChart.offsetWidth;
  const radius = Math.min(width, height) / 2 - 10;

  let groupedByRole = d3
    .nest()
    .key(function (d) {
      return roles[d.role_id - 1].name;
    })
    .entries(sortedData);

  groupedByRole.sort((a, b) => d3.ascending(a.key, b.key));

  const pie = d3.pie().value((d) => d.values.length);
  const data = pie(groupedByRole);

  var color = d3
    .scaleOrdinal()
    .domain(data)
    .range([
      "#e3eef9",
      "#cfe1f2",
      "#bcdaf5",
      "#a8d2ee",
      "#84bedf",
      "#6daed5",
      "#4b97c9",
      "#2f7ebc",
      "#1864aa",
      "#0a4a90",
      "#08306b",
      "#012150",
    ]);

  var chart = d3
    .select(".pie-chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  chart
    .selectAll()
    .data(data)
    .enter()
    .append("path")
    .attr("d", d3.arc().innerRadius(0).outerRadius(radius))
    .attr("fill", function (d) {
      return color(d.index);
    })
    .attr("stroke", "#fff")
    .style("stroke-width", "0.05rem");
}

select.addEventListener("change", selectedSort);
checkboxes.addEventListener("change", filterBy);
barLink.addEventListener("click", () => {
  if (pieChart.style.display == "") {
    pieChart.style.display = "none";
  }

  if (barChart.style.display == "") {
    barChart.style.display = "none";
  } else {
    barChart.style.display = "";
    createBarChart();
  }
});
pieLink.addEventListener("click", () => {
  if (barChart.style.display == "") {
    barChart.style.display = "none";
  }

  if (pieChart.style.display == "") {
    pieChart.style.display = "none";
  } else {
    pieChart.style.display = "";
    createPieChart();
  }
});

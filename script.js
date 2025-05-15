const zones = ['구역1'];  // 구글시트의 sheet명 목록
const baseUrl = "https://script.google.com/macros/s/앱스크립트_URL/exec";

document.getElementById('zoneSelect').onchange = loadZoneData;

function loadZoneData() {
  const zone = document.getElementById('zoneSelect').value;
  fetch(`${baseUrl}?zone=${zone}`)
    .then(res => res.json())
    .then(data => renderBuildings(data, zone));
}

function renderBuildings(data, zone) {
  const header = document.getElementById('zoneHeader');
  const container = document.getElementById('buildingList');
  container.innerHTML = "";
  header.innerHTML = `<p><b>구역명:</b> ${zone}</p>`;

  const headers = data[0];
  const idx = Object.fromEntries(headers.map((h, i) => [h, i]));
  const byFloor = {};

  data.slice(1).forEach(row => {
    const 층 = row[idx['층']];
    if (!byFloor[층]) byFloor[층] = [];
    byFloor[층].push(row);
  });

  Object.entries(byFloor).forEach(([floor, rows]) => {
    const floorDiv = document.createElement('div');
    floorDiv.className = "floor";
    floorDiv.innerHTML = `<h4>${floor}</h4>`;
    rows.forEach((row, i) => {
      const 호 = row[idx['호수']];
      const 방문 = row[idx['방문 표시']];
      const rowElem = document.createElement('div');
      rowElem.innerHTML = `<b>${호}</b> `;
      ['만남', '부재', '초기화'].forEach(status => {
        const btn = document.createElement('button');
        btn.innerText = status;
        const isActive = (방문 === status) || (status === '초기화' && 방문 !== '');
        btn.className = isActive ? "active" : "inactive";
        btn.onclick = () => {
          const value = (status === '초기화') ? '' : status;
          updateStatus(zone, i + 2, value);
        };
        rowElem.appendChild(btn);
      });
      floorDiv.appendChild(rowElem);
    });
    container.appendChild(floorDiv);
  });
}

function updateStatus(zone, row, value) {
  fetch(baseUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: new URLSearchParams({ zone, row, col: '방문 표시', value })
  }).then(() => loadZoneData());
}

window.onload = () => {
  const sel = document.getElementById('zoneSelect');
  zones.forEach(z => {
    const opt = document.createElement('option');
    opt.value = opt.text = z;
    sel.appendChild(opt);
  });
};

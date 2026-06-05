const SHEET_ID = '1NUPKDXd7iL0S_GgQOlmZs_sIreqyGaxTYKwAKSN_l7c';
const GID = '753591601';
const container = document.getElementById('container');

window.google = {
  visualization: {
    Query: {
      setResponse: function(json) {
        try {
          const rows = json.table.rows;
          const cols = json.table.cols.map(c => c.label);
          container.innerHTML = '';
          rows.forEach(row => {
            let html = '';
            row.c.forEach((cell, i) => {
              if (cols[i] === '№') return;
              const val = cell ? cell.v : '';
              if (val) {
                html += '<div class="field"><span class="label">' + cols[i] + ':</span> ' + val + '</div>';
              }
            });
            container.innerHTML += '<div class="card">' + html + '</div>';
          });
        } catch(e) {
          container.innerHTML = '<div class="error">' + e.message + '</div>';
        }
      }
    }
  }
};

const s = document.createElement('script');
s.src = 'https://docs.google.com/spreadsheets/d/' + SHEET_ID + '/gviz/tq?tq=&gid=' + GID + '&tqx=out:json';
document.body.appendChild(s);


const STORAGE_KEY = "cybershield_reports";

// MOBILE MENU
function toggleMenu() {
    document.getElementById("navbar").classList.toggle("open");
}

// URL CHECKER
function checkURL() {
    let url = document.getElementById("urlInput").value.trim();
    let result = document.getElementById("urlResult");

    try {
        let parsed = new URL(
            url.includes("://") ? url : "https://" + url
        );

        let warnings = [];

        if (parsed.protocol !== "https:") {
            warnings.push("Website does not use HTTPS.");
        }

        if (/^\\d{1,3}(\\.\\d{1,3}){3}$/.test(parsed.hostname)) {
            warnings.push("Website uses an IP address.");
        }

        if (parsed.hostname.includes("xn--")) {
            warnings.push("Domain contains encoded characters.");
        }

        if (/@/.test(url)) {
            warnings.push("URL contains an unusual @ symbol.");
        }

        result.textContent = warnings.length
            ? "Warning: " + warnings.join(" ")
            : "No obvious warning detected. This does not guarantee safety.";

        result.style.color = warnings.length ? "red" : "green";

    } catch {
        result.textContent = "Please enter a valid URL.";
        result.style.color = "red";
    }
}

// EMAIL CHECKER
function checkEmail() {
    let subject = document.getElementById("emailSubject").value;
    let content = document.getElementById("emailContent").value;

    let message = (subject + " " + content).toLowerCase();

    let warnings = [];

    if (message.includes("urgent") ||
        message.includes("immediately")) {
        warnings.push("Urgent language detected.");
    }

    if (message.includes("password") ||
        message.includes("otp")) {
        warnings.push("Sensitive information is mentioned.");
    }

    if (message.includes("click here")) {
        warnings.push("Suspicious click request detected.");
    }

    let result = document.getElementById("emailResult");

    result.textContent = warnings.length
        ? "Warning: " + warnings.join(" ")
        : "No obvious warning detected. Email authenticity is not guaranteed.";

    result.style.color = warnings.length ? "red" : "green";
}

// GET REPORTS
function getReports() {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
        return [];
    }
}

// SAVE REPORTS
function saveReports(reports) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

// SUBMIT REPORT
document.getElementById("incidentForm")
.addEventListener("submit", function(event) {

    event.preventDefault();

    let report = {
        id: "CS" + Date.now(),
        type: document.getElementById("incidentType").value,
        description: document.getElementById("description").value,
        date: document.getElementById("date").value,
        time: document.getElementById("time").value,
        location: document.getElementById("location").value,
        severity: document.getElementById("severity").value,
        evidence: document.getElementById("evidence").files[0]?.name || "",
        name: document.getElementById("name").value,
        contact: document.getElementById("contact").value,
        email: document.getElementById("email").value,
        status: "Submitted"
    };

    let reports = getReports();

    reports.unshift(report);

    saveReports(reports);

    document.getElementById("message").textContent =
        "Report submitted successfully! ID: " + report.id;

    this.reset();

    displayReports();
});

// DISPLAY REPORTS
function displayReports() {

    let reports = getReports();

    let list = document.getElementById("reportsList");

    document.getElementById("total").textContent =
        reports.length;

    document.getElementById("high").textContent =
        reports.filter(r => r.severity === "High").length;

    if (reports.length === 0) {
        list.textContent = "No reports submitted yet.";
        return;
    }

    list.innerHTML = "";

    reports.forEach(function(report) {

        let div = document.createElement("div");

        div.className = "report-item";

        let heading = document.createElement("h3");
        heading.textContent = report.type;

        let description = document.createElement("p");
        description.textContent = report.description;

        let details = document.createElement("p");
        details.textContent =
            "ID: " + report.id +
            " | Date: " + report.date +
            " | Time: " + report.time;

        let severity = document.createElement("p");
        severity.textContent = "Severity: " + report.severity;

        let status = document.createElement("p");
        status.textContent = "Status: " + report.status;

        let evidence = document.createElement("p");
        evidence.textContent = report.evidence
            ? "Evidence filename: " + report.evidence
            : "No evidence attached";

        let deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete Report";
        deleteBtn.className = "delete-btn";

        deleteBtn.onclick = function() {
            deleteReport(report.id);
        };

        div.append(
            heading, description, details,
            severity, status, evidence, deleteBtn
        );

        list.appendChild(div);
    });
}

// DELETE ONE REPORT
function deleteReport(id) {

    let reports = getReports();

    reports = reports.filter(function(report) {
        return report.id !== id;
    });

    saveReports(reports);

    displayReports();
}

// CLEAR ALL REPORTS
function clearReports() {

    if (confirm("Are you sure you want to delete all reports?")) {
        localStorage.removeItem(STORAGE_KEY);
        displayReports();
    }
}

// AUTOMATIC DATE
document.getElementById("date").value =
    new Date().toLocaleDateString("en-CA");

// LOAD SAVED REPORTS
displayReports();

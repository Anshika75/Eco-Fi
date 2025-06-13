// Global variables for data
let ticketsData = []
let suggestedTickets = []
let teamsByDepartment = {}

// Load data from JSON file
async function loadData() {
  try {
    const response = await fetch("data.json")
    const data = await response.json()
    ticketsData = data.tickets
    suggestedTickets = data.suggestedTickets
    teamsByDepartment = data.teamsByDepartment
  } catch (error) {
    console.error("Error loading data:", error)
    // Fallback to empty arrays if data loading fails
    ticketsData = []
    suggestedTickets = []
    teamsByDepartment = {}
  }
}

// DOM elements
const columns = {
  defined: document.getElementById("defined-column"),
  review: document.getElementById("review-column"),
  test: document.getElementById("test-column"),
  completed: document.getElementById("completed-column"),
  accepted: document.getElementById("accepted-column"),
}

const drawerOverlay = document.getElementById("drawerOverlay")
const ticketDrawer = document.getElementById("ticketDrawer")
const closeDrawerBtn = document.getElementById("closeDrawer")
const searchInput = document.querySelector(".search-input")
const filterTags = document.querySelectorAll(".filter-tag")
const filterDropdowns = document.querySelectorAll(".filter-dropdown")
const sidebarToggle = document.getElementById("sidebarToggle")
const sidebar = document.getElementById("sidebar")
const mainContent = document.querySelector(".main-content")
const helpButton = document.getElementById("helpButton")
const helpContent = document.getElementById("helpContent")
const createIncidentOverlay = document.getElementById("createIncidentOverlay")
const createIncidentForm = document.getElementById("createIncidentForm")

// Initialize the dashboard
async function initDashboard() {
  await loadData()
  renderTickets()
  setupEventListeners()
  animateWidgetCounters()
}

// Render tickets in their respective columns
function renderTickets(filteredTickets = ticketsData) {
  // Clear all columns
  Object.values(columns).forEach((column) => {
    if (column) column.innerHTML = ""
  })

  // Group tickets by status
  const ticketsByStatus = {
    defined: [],
    review: [],
    test: [],
    completed: [],
    accepted: [],
  }

  filteredTickets.forEach((ticket) => {
    // Move development tickets to review column
    if (ticket.status === "development") {
      ticketsByStatus["review"].push(ticket)
    } else if (ticketsByStatus[ticket.status]) {
      ticketsByStatus[ticket.status].push(ticket)
    }
  })

  // Render tickets in each column with staggered animation
  Object.keys(ticketsByStatus).forEach((status) => {
    const column = columns[status]
    if (column) {
      ticketsByStatus[status].forEach((ticket, index) => {
        const ticketCard = createTicketCard(ticket)
        ticketCard.style.animationDelay = `${index * 0.1}s`
        column.appendChild(ticketCard)
      })
    }
  })

  // Update ticket counts
  updateTicketCounts(ticketsByStatus)
  updateWidgetValues(filteredTickets)
}

// Create a ticket card element
function createTicketCard(ticket) {
  const card = document.createElement("div")
  const priorityClass = `priority-${ticket.urgency}`
  const deadClass = ticket.isDead ? "dead-ticket" : ""
  card.className = `ticket-card ${priorityClass} ${deadClass}`
  card.dataset.ticketId = ticket.id

  const tagsHTML = ticket.tags.map((tag) => `<span class="ticket-tag">${tag}</span>`).join("")

  const resolutionTimeIcon = ticket.longResolution
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="resolution-time-icon"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>`
    : ""

  const deadTicketIcon = ticket.isDead
    ? `<div class="dead-ticket-indicator">
         <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
           <rect x="6" y="4" width="4" height="16"></rect>
           <rect x="14" y="4" width="4" height="16"></rect>
         </svg>
       </div>`
    : ""

  card.innerHTML = `
        <div class="ticket-header">
            <span class="ticket-id">${ticket.id}</span>
            ${deadTicketIcon}
        </div>
        <div class="ticket-summary">${ticket.summary}</div>
        <div class="ticket-tags">${tagsHTML}</div>
        <div class="ticket-status">${formatStatus(ticket.status)}</div>
        <div class="ticket-footer">
            <div class="assignee">
                <div class="avatar">${ticket.assigneeInitials}</div>
                <span>${ticket.assignee}</span>
            </div>
            <div class="resolution-time">
                ${resolutionTimeIcon}
                <span>${ticket.resolutionTime}</span>
            </div>
        </div>
    `

  // Navigate to ticket details page instead of opening drawer
  card.addEventListener("click", () => openTicketDetailsPage(ticket))
  return card
}

// Format status for display
function formatStatus(status) {
  const statusMap = {
    defined: "Newly Reported",
    review: "Being Investigated",
    development: "Being Investigated",
    test: "Verification",
    completed: "Resolved",
    accepted: "Closed/Rejected",
  }
  return statusMap[status] || status
}

// Update ticket counts in column headers
function updateTicketCounts(ticketsByStatus) {
  Object.keys(ticketsByStatus).forEach((status) => {
    const column = document.querySelector(`[data-status="${status}"]`)
    if (column) {
      const countElement = column.querySelector(".ticket-count")
      if (countElement) {
        countElement.textContent = ticketsByStatus[status].length
      }
    }
  })
}

// Update widget values based on filtered tickets
function updateWidgetValues(filteredTickets) {
  const totalTickets = filteredTickets.length
  const deadTickets = filteredTickets.filter((ticket) => ticket.isDead).length
  const criticalTickets = filteredTickets.filter((ticket) => ticket.urgency === "critical").length
  const resolvedToday = filteredTickets.filter((ticket) => ticket.status === "completed").length

  // Calculate average resolution time
  const resolutionTimes = filteredTickets
    .map((ticket) => {
      const timeStr = ticket.resolutionTime.replace("~", "").replace("h", "")
      return Number.parseFloat(timeStr) || 0
    })
    .filter((time) => time > 0)

  const avgResolution =
    resolutionTimes.length > 0 ? (resolutionTimes.reduce((a, b) => a + b, 0) / resolutionTimes.length).toFixed(1) : 0

  // Find most active department
  const departments = {}
  filteredTickets.forEach((ticket) => {
    ticket.tags.forEach((tag) => {
      departments[tag] = (departments[tag] || 0) + 1
    })
  })
  const mostActive =
    Object.keys(departments).length > 0
      ? Object.keys(departments).reduce((a, b) => (departments[a] > departments[b] ? a : b), "Backend")
      : "Backend"

  // Update widget values with animation
  const widgets = document.querySelectorAll(".widget-value")
  if (widgets[0]) animateCounter(widgets[0], totalTickets)
  if (widgets[1]) animateCounter(widgets[1], deadTickets)
  if (widgets[2]) animateCounter(widgets[2], avgResolution, "h")
  if (widgets[3]) widgets[3].textContent = mostActive
  if (widgets[4]) animateCounter(widgets[4], criticalTickets)
  if (widgets[5]) animateCounter(widgets[5], resolvedToday)
}

// Animate counter values
function animateCounter(element, targetValue, suffix = "") {
  if (!element) return

  const startValue = 0
  const duration = 500
  const startTime = performance.now()

  function updateCounter(currentTime) {
    const elapsed = currentTime - startTime
    const progress = Math.min(elapsed / duration, 1)

    const currentValue = startValue + (targetValue - startValue) * easeOutQuad(progress)
    element.textContent = Math.floor(currentValue) + suffix

    if (progress < 1) {
      requestAnimationFrame(updateCounter)
    } else {
      element.textContent = targetValue + suffix
    }
  }

  requestAnimationFrame(updateCounter)
}

// Easing function for smooth animation
function easeOutQuad(t) {
  return t * (2 - t)
}

// Animate widget counters on load
function animateWidgetCounters() {
  const widgets = document.querySelectorAll(".widget-value[data-value]")
  widgets.forEach((widget, index) => {
    setTimeout(() => {
      const targetValue = widget.dataset.value
      const suffix = widget.textContent.replace(/[0-9.]/g, "")
      animateCounter(widget, Number.parseFloat(targetValue), suffix)
    }, index * 100)
  })
}

// Navigate to ticket details page
function openTicketDetailsPage(ticket) {
  // Store ticket data in localStorage for the details page
  localStorage.setItem("currentTicket", JSON.stringify(ticket))
  localStorage.setItem("allTickets", JSON.stringify(ticketsData))
  localStorage.setItem("suggestedTickets", JSON.stringify(suggestedTickets))

  // Navigate to ticket details page in the same tab
  window.location.href = `ticket-details.html?id=${ticket.id}`
}

// Setup event listeners
function setupEventListeners() {
  // Sidebar toggle
  const sidebarToggleBtn = document.getElementById("sidebarToggle")
  if (sidebarToggleBtn) {
    sidebarToggleBtn.addEventListener("click", toggleSidebar)
  }

  // Help toggle
  if (helpButton) {
    helpButton.addEventListener("click", toggleHelp)
  }

  // Close help when clicking outside
  document.addEventListener("click", (e) => {
    if (helpButton && helpContent && !helpButton.contains(e.target) && !helpContent.contains(e.target)) {
      helpContent.classList.remove("active")
    }
  })

  // Search functionality
  if (searchInput) {
    searchInput.addEventListener("input", handleSearch)
  }

  // Quick filter buttons
  const criticalFilter = document.getElementById("critical-filter")
  const deadFilter = document.getElementById("dead-filter")

  if (criticalFilter) {
    criticalFilter.addEventListener("click", () => handleQuickFilter("critical"))
  }
  if (deadFilter) {
    deadFilter.addEventListener("click", () => handleQuickFilter("dead"))
  }

  // Sort dropdown
  const sortDropdown = document.getElementById("sort-filter")
  if (sortDropdown) {
    sortDropdown.addEventListener("change", handleSort)
  }

  // Sidebar navigation
  const navItems = document.querySelectorAll(".nav-item")
  navItems.forEach((item) => {
    item.addEventListener("click", () => {
      navItems.forEach((nav) => nav.classList.remove("active"))
      item.classList.add("active")
    })
  })

  // Add click event to the "My Dashboard" nav item
  const myDashboardNavItem = document.getElementById("myDashboardNav")
  if (myDashboardNavItem) {
    myDashboardNavItem.addEventListener("click", () => {
      window.location.href = "user-dashboard.html"
    })
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawerOverlay?.classList.contains("active")) {
      closeTicketDrawer()
    }
    if (e.key === "Escape" && helpContent?.classList.contains("active")) {
      helpContent.classList.remove("active")
    }
    if ((e.ctrlKey || e.metaKey) && e.key === "b") {
      e.preventDefault()
      toggleSidebar()
    }
  })

  // Create Incident Modal
  const createIncidentBtn = document.getElementById("createIncidentBtn")
  const closeCreateIncident = document.getElementById("closeCreateIncident")
  const cancelIncident = document.getElementById("cancelIncident")

  if (createIncidentBtn) {
    createIncidentBtn.addEventListener("click", openCreateIncidentModal)
  }
  if (closeCreateIncident) {
    closeCreateIncident.addEventListener("click", closeCreateIncidentModal)
  }
  if (cancelIncident) {
    cancelIncident.addEventListener("click", closeCreateIncidentModal)
  }
  if (createIncidentOverlay) {
    createIncidentOverlay.addEventListener("click", (e) => {
      if (e.target === createIncidentOverlay) {
        closeCreateIncidentModal()
      }
    })
  }

  if (createIncidentForm) {
    createIncidentForm.addEventListener("submit", handleCreateIncident)
  }

  // Initialize custom selects after DOM is ready
  setTimeout(initCustomSelects, 100)
}

// Initialize custom select functionality for searchable dropdowns
function initCustomSelects() {
  const customSelects = document.querySelectorAll(".custom-select")

  customSelects.forEach((select) => {
    const selected = select.querySelector(".select-selected")
    const items = select.querySelector(".select-items")
    const options = select.querySelectorAll(".dropdown-options div")
    const search = select.querySelector(".dropdown-search")

    if (!selected || !items) return

    // Toggle dropdown
    selected.addEventListener("click", function (e) {
      e.stopPropagation()
      closeAllSelect(this)
      items.classList.toggle("select-hide")
      selected.classList.toggle("active")

      if (!items.classList.contains("select-hide")) {
        if (search) {
          setTimeout(() => {
            search.focus()
            search.value = ""
          }, 50)
        }
        // Show all options when opening
        options.forEach((option) => {
          option.style.display = ""
        })
      }
    })

    // Handle option selection
    options.forEach((option) => {
      option.addEventListener("click", function (e) {
        e.stopPropagation()
        selected.innerHTML = this.textContent
        selected.setAttribute("data-value", this.getAttribute("data-value"))
        items.classList.add("select-hide")
        selected.classList.remove("active")

        // Apply filter immediately
        applyAllFilters()
      })
    })

    // Handle search (only for dropdowns that have search)
    if (search) {
      search.addEventListener("input", function (e) {
        e.stopPropagation()
        const filter = this.value.toLowerCase()
        options.forEach((option) => {
          if (option.textContent.toLowerCase().indexOf(filter) > -1) {
            option.style.display = ""
          } else {
            option.style.display = "none"
          }
        })
      })

      // Prevent dropdown from closing when clicking in search
      search.addEventListener("click", (e) => {
        e.stopPropagation()
      })

      // Prevent dropdown from closing when clicking search container
      const searchContainer = select.querySelector(".dropdown-search-container")
      if (searchContainer) {
        searchContainer.addEventListener("click", (e) => {
          e.stopPropagation()
        })
      }
    }
  })

  // Close dropdowns when clicking elsewhere
  document.addEventListener("click", closeAllSelect)
}

function closeAllSelect(elmnt) {
  const items = document.querySelectorAll(".select-items")
  const selected = document.querySelectorAll(".select-selected")

  items.forEach((item, idx) => {
    if (elmnt !== selected[idx]) {
      item.classList.add("select-hide")
      if (selected[idx]) {
        selected[idx].classList.remove("active")
      }
    }
  })
}

// Fix quick filter functionality
function handleQuickFilter(type) {
  const criticalFilter = document.getElementById("critical-filter")
  const deadFilter = document.getElementById("dead-filter")

  // Clear other quick filters first
  if (type === "critical") {
    deadFilter?.classList.remove("active")
  } else if (type === "dead") {
    criticalFilter?.classList.remove("active")
  }

  // Toggle the clicked filter
  const clickedFilter = type === "critical" ? criticalFilter : deadFilter
  if (clickedFilter) {
    clickedFilter.classList.toggle("active")
  }

  // Apply all filters
  applyAllFilters()
}

// Fix sort functionality
function handleSort(e) {
  const sortType = e.target.value
  const sortedTickets = [...getFilteredTickets()]

  switch (sortType) {
    case "a-to-z":
      sortedTickets.sort((a, b) => a.summary.localeCompare(b.summary))
      break
    case "z-to-a":
      sortedTickets.sort((a, b) => b.summary.localeCompare(a.summary))
      break
    case "resolution-low-high":
      sortedTickets.sort((a, b) => {
        const timeA = Number.parseFloat(a.resolutionTime.replace("~", "").replace("h", "")) || 0
        const timeB = Number.parseFloat(b.resolutionTime.replace("~", "").replace("h", "")) || 0
        return timeA - timeB
      })
      break
    case "priority-high-low":
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      sortedTickets.sort((a, b) => (priorityOrder[b.urgency] || 0) - (priorityOrder[a.urgency] || 0))
      break
    case "date-created":
      sortedTickets.sort((a, b) => a.id.localeCompare(b.id))
      break
    default:
      // No sorting, use filtered tickets as is
      break
  }

  renderTickets(sortedTickets)
}

// Create a unified function to get filtered tickets
function getFilteredTickets() {
  let filteredTickets = [...ticketsData]

  // Apply dropdown filters
  const statusSelect = document.getElementById("status-select")
  const statusFilter = statusSelect?.querySelector(".select-selected")?.getAttribute("data-value") || "all"

  const assigneeSelect = document.getElementById("assignee-select")
  const assigneeFilter = assigneeSelect?.querySelector(".select-selected")?.getAttribute("data-value") || "all"

  const prioritySelect = document.getElementById("priority-select")
  const urgencyFilter = prioritySelect?.querySelector(".select-selected")?.getAttribute("data-value") || "all"

  const departmentSelect = document.getElementById("department-select")
  const departmentFilter = departmentSelect?.querySelector(".select-selected")?.getAttribute("data-value") || "all"

  const teamsSelect = document.getElementById("teams-select")
  const teamsFilter = teamsSelect?.querySelector(".select-selected")?.getAttribute("data-value") || "all"

  // Apply status filter
  if (statusFilter !== "all") {
    const statusMap = {
      "newly-reported": "defined",
      "being-investigated": ["review", "development"],
      verification: "test",
      resolved: "completed",
      closed: "accepted",
    }

    filteredTickets = filteredTickets.filter((ticket) => {
      const mappedStatus = statusMap[statusFilter]
      if (Array.isArray(mappedStatus)) {
        return mappedStatus.includes(ticket.status)
      }
      return ticket.status === mappedStatus
    })
  }

  // Apply assignee filter
  if (assigneeFilter !== "all") {
    const assigneeMap = {
      "john-doe": "John Doe",
      "jane-smith": "Jane Smith",
      "mike-johnson": "Mike Johnson",
      "sarah-wilson": "Sarah Wilson",
      "tom-brown": "Tom Brown",
      "lisa-davis": "Lisa Davis",
      "alex-chen": "Alex Chen",
      "emma-wilson": "Emma Wilson",
      "ryan-park": "Ryan Park",
      "diana-lee": "Diana Lee",
    }
    const assigneeName = assigneeMap[assigneeFilter]
    if (assigneeName) {
      filteredTickets = filteredTickets.filter((ticket) => ticket.assignee === assigneeName)
    }
  }

  // Apply priority filter
  if (urgencyFilter !== "all") {
    filteredTickets = filteredTickets.filter((ticket) => ticket.urgency === urgencyFilter)
  }

  // Apply department filter
  if (departmentFilter !== "all") {
    filteredTickets = filteredTickets.filter((ticket) =>
      ticket.tags.some((tag) => tag.toLowerCase() === departmentFilter.toLowerCase()),
    )
  }

  // Apply teams filter
  if (teamsFilter !== "all") {
    const teamMap = {
      "frontend-team": ["Frontend", "UI", "UX"],
      "backend-team": ["Backend", "API", "Database"],
      "mobile-team": ["Mobile", "iOS", "Android"],
      "devops-team": ["DevOps", "Infrastructure", "CI/CD"],
      "qa-team": ["QA", "Testing", "Automation"],
      "design-team": ["Design", "UX", "UI"],
    }

    const teamTags = teamMap[teamsFilter] || []
    if (teamTags.length > 0) {
      filteredTickets = filteredTickets.filter((ticket) => ticket.tags.some((tag) => teamTags.includes(tag)))
    }
  }

  // Apply quick filters
  const criticalFilter = document.getElementById("critical-filter")
  const deadFilter = document.getElementById("dead-filter")

  if (criticalFilter?.classList.contains("active")) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.urgency === "critical")
  }

  if (deadFilter?.classList.contains("active")) {
    filteredTickets = filteredTickets.filter((ticket) => ticket.isDead)
  }

  return filteredTickets
}

// Create a unified function to apply all filters
function applyAllFilters() {
  const filteredTickets = getFilteredTickets()

  // Apply current sort if any
  const sortDropdown = document.getElementById("sort-filter")
  if (sortDropdown && sortDropdown.value !== "default") {
    const sortEvent = { target: { value: sortDropdown.value } }
    handleSort(sortEvent)
  } else {
    renderTickets(filteredTickets)
  }
}

// Handle search
function handleSearch(e) {
  const searchTerm = e.target.value.toLowerCase()

  if (searchTerm.trim() === "") {
    // If search is empty, apply all other filters
    applyAllFilters()
    return
  }

  // Get filtered tickets first, then apply search
  const baseFilteredTickets = getFilteredTickets()
  const searchFilteredTickets = baseFilteredTickets.filter(
    (ticket) =>
      ticket.id.toLowerCase().includes(searchTerm) ||
      ticket.summary.toLowerCase().includes(searchTerm) ||
      ticket.assignee.toLowerCase().includes(searchTerm) ||
      ticket.tags.some((tag) => tag.toLowerCase().includes(searchTerm)),
  )
  renderTickets(searchFilteredTickets)
}

// Toggle sidebar
function toggleSidebar() {
  if (sidebar) {
    sidebar.classList.toggle("collapsed")
  }
}

// Toggle help
function toggleHelp() {
  if (helpContent) {
    helpContent.classList.toggle("active")
  }
}

// Close ticket drawer
function closeTicketDrawer() {
  if (drawerOverlay) {
    drawerOverlay.classList.remove("active")
  }
  if (ticketDrawer) {
    ticketDrawer.classList.remove("active")
  }
  document.body.style.overflow = ""
}

// Create Incident Modal Functions
let currentStep = 1
const totalSteps = 6

function openCreateIncidentModal() {
  currentStep = 1
  if (createIncidentOverlay) {
    createIncidentOverlay.classList.add("active")
    document.body.style.overflow = "hidden"
    updateStepDisplay()
    // Focus on first input
    setTimeout(() => {
      const firstInput = document.getElementById("incidentTitle")
      if (firstInput) firstInput.focus()
    }, 100)
  }
}

function closeCreateIncidentModal() {
  if (createIncidentOverlay) {
    createIncidentOverlay.classList.remove("active")
    document.body.style.overflow = "auto"
    currentStep = 1
    if (createIncidentForm) {
      createIncidentForm.reset()
    }

    // Reset step indicators
    document.querySelectorAll(".step").forEach((step, index) => {
      step.classList.remove("active", "completed")
      if (index === 0) step.classList.add("active")
    })

    // Reset form steps
    document.querySelectorAll(".form-step").forEach((step, index) => {
      step.classList.remove("active")
      if (index === 0) step.classList.add("active")
    })

    // Clear any error states
    document.querySelectorAll(".error").forEach((el) => el.classList.remove("error"))
  }
}

// Multi-step form functionality
function initMultiStepForm() {
  const departmentSelect = document.getElementById("incidentDepartment")
  const teamSelect = document.getElementById("incidentTeam")
  const expectedPointsInput = document.getElementById("expectedPoints")
  const storyHoursDisplay = document.getElementById("storyHours")
  const dueDateInput = document.getElementById("dueDate")
  const nextBtn = document.getElementById("nextStep")
  const prevBtn = document.getElementById("prevStep")
  const submitBtn = document.getElementById("submitIncident")

  if (dueDateInput) dueDateInput.disabled = true

  // Make step indicators clickable
  document.querySelectorAll(".step").forEach((step, index) => {
    step.addEventListener("click", () => {
      const targetStep = index + 1
      if (targetStep <= currentStep || validateStepsUpTo(targetStep - 1)) {
        currentStep = targetStep
        updateStepDisplay()
      }
    })
  })

  // Department change handler
  if (departmentSelect && teamSelect) {
    departmentSelect.addEventListener("change", function () {
      const selectedDepartment = this.value
      teamSelect.innerHTML = '<option value="">Select Team</option>'

      if (selectedDepartment && teamsByDepartment[selectedDepartment]) {
        teamsByDepartment[selectedDepartment].forEach((team) => {
          const option = document.createElement("option")
          option.value = team
          option.textContent = team
          teamSelect.appendChild(option)
        })
      }
    })
  }

  // Expected Points calculation
  if (expectedPointsInput && storyHoursDisplay && dueDateInput) {
    expectedPointsInput.addEventListener("input", function () {
      const points = Number.parseFloat(this.value) || 0
      const hours = points * 8
      storyHoursDisplay.textContent = `Hours: ${hours} (1 point = 8 hours)`

      // Enable/disable due date based on points
      if (points > 0) {
        dueDateInput.disabled = false
        updateDueDateConstraints(points)
      } else {
        dueDateInput.disabled = true
        dueDateInput.value = ""
      }
    })
  }

  // Navigation handlers
  if (nextBtn) nextBtn.addEventListener("click", nextStep)
  if (prevBtn) prevBtn.addEventListener("click", prevStep)

  // Generate smart suggestions when reaching step 6
  document.addEventListener("stepChanged", (e) => {
    if (e.detail.step === 6) {
      generateSmartSuggestions()
    }
  })
}

// Step navigation functions
function nextStep() {
  if (validateCurrentStep()) {
    if (currentStep < totalSteps) {
      currentStep++
      updateStepDisplay()

      // Dispatch custom event for step change
      document.dispatchEvent(new CustomEvent("stepChanged", { detail: { step: currentStep } }))
    }
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--
    updateStepDisplay()
  }
}

function updateStepDisplay() {
  // Update step indicators
  document.querySelectorAll(".step").forEach((step, index) => {
    const stepNumber = index + 1
    step.classList.remove("active", "completed")

    if (stepNumber === currentStep) {
      step.classList.add("active")
    } else if (stepNumber < currentStep) {
      step.classList.add("completed")
    }
  })

  // Update form steps
  document.querySelectorAll(".form-step").forEach((step, index) => {
    const stepNumber = index + 1
    step.classList.remove("active")

    if (stepNumber === currentStep) {
      step.classList.add("active")
    }
  })

  // Update navigation buttons
  const prevBtn = document.getElementById("prevStep")
  const nextBtn = document.getElementById("nextStep")
  const submitBtn = document.getElementById("submitIncident")

  // Show/hide previous button
  if (prevBtn) {
    prevBtn.style.display = currentStep === 1 ? "none" : "inline-flex"
  }

  // Show/hide next/submit buttons
  if (currentStep === totalSteps) {
    if (nextBtn) nextBtn.style.display = "none"
    if (submitBtn) submitBtn.style.display = "inline-flex"
  } else {
    if (nextBtn) nextBtn.style.display = "inline-flex"
    if (submitBtn) submitBtn.style.display = "none"
  }
}

function validateCurrentStep() {
  const currentStepElement = document.querySelector(`.form-step[data-step="${currentStep}"]`)
  if (!currentStepElement) return true

  const requiredFields = currentStepElement.querySelectorAll("[required]")
  let isValid = true

  // Clear previous error states
  currentStepElement.querySelectorAll(".error").forEach((el) => el.classList.remove("error"))

  // Validate required text inputs and textareas
  requiredFields.forEach((field) => {
    if (field.type !== "radio" && !field.value.trim()) {
      field.classList.add("error")
      isValid = false
    }
  })

  // Validate radio groups
  const radioGroups = currentStepElement.querySelectorAll('input[type="radio"][required]')
  const radioGroupNames = [...new Set(Array.from(radioGroups).map((radio) => radio.name))]

  radioGroupNames.forEach((groupName) => {
    const groupRadios = currentStepElement.querySelectorAll(`input[name="${groupName}"]`)
    const isGroupValid = Array.from(groupRadios).some((radio) => radio.checked)

    if (!isGroupValid) {
      groupRadios.forEach((radio) => {
        const closest = radio.closest(".radio-option")
        if (closest) closest.classList.add("error")
      })
      isValid = false
    }
  })

  if (!isValid) {
    showNotification("Please fill in all required fields before proceeding.", "error")
  }

  return isValid
}

function validateStepsUpTo(stepNumber) {
  for (let i = 1; i <= stepNumber; i++) {
    const stepElement = document.querySelector(`.form-step[data-step="${i}"]`)
    if (!stepElement) continue

    const requiredFields = stepElement.querySelectorAll("[required]")

    for (const field of requiredFields) {
      if (!field.value.trim()) {
        showNotification(`Please complete Step ${i} before proceeding.`, "error")
        return false
      }
    }

    // Check radio groups
    const radioGroups = stepElement.querySelectorAll('input[type="radio"][required]')
    const radioGroupNames = [...new Set(Array.from(radioGroups).map((radio) => radio.name))]

    for (const groupName of radioGroupNames) {
      const groupRadios = stepElement.querySelectorAll(`input[name="${groupName}"]`)
      const isGroupValid = Array.from(groupRadios).some((radio) => radio.checked)

      if (!isGroupValid) {
        showNotification(`Please complete Step ${i} before proceeding.`, "error")
        return false
      }
    }
  }
  return true
}

function updateDueDateConstraints(points) {
  const dueDateInput = document.getElementById("dueDate")
  if (!dueDateInput) return

  const today = new Date()
  const minDays = Math.max(1, Math.ceil(points))
  const minDate = new Date(today.getTime() + minDays * 24 * 60 * 60 * 1000)

  // Set minimum date
  dueDateInput.min = minDate.toISOString().split("T")[0]

  // If current value is before minimum, clear it
  if (dueDateInput.value && new Date(dueDateInput.value) < minDate) {
    dueDateInput.value = ""
  }
}

function generateSmartSuggestions() {
  const title = document.getElementById("incidentTitle")?.value.toLowerCase() || ""
  const errorMessages = document.getElementById("errorMessages")?.value.toLowerCase() || ""
  const expectedBehavior = document.getElementById("expectedBehavior")?.value.toLowerCase() || ""
  const observedIssues = document.getElementById("observedIssues")?.value.toLowerCase() || ""

  // Combine all text for keyword matching
  const allText = [title, errorMessages, expectedBehavior, observedIssues].join(" ")
  const keywords = allText.split(" ").filter((word) => word.length > 3)

  // Use suggestedTickets data
  let suggestions = []

  if (keywords.length > 0) {
    // Filter suggested tickets based on keywords
    suggestions = suggestedTickets
      .filter((ticket) => {
        const ticketText = (ticket.summary + " " + (ticket.description || "")).toLowerCase()
        return keywords.some((keyword) => ticketText.includes(keyword))
      })
      .slice(0, 6)
  }

  // If no keyword matches, show first 6 suggested tickets
  if (suggestions.length === 0) {
    suggestions = suggestedTickets.slice(0, 6)
  }

  const suggestionsContainer = document.getElementById("smartSuggestions")
  if (!suggestionsContainer) return

  suggestionsContainer.innerHTML = ""

  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML =
      '<p class="no-suggestions" style="grid-column: 1 / -1;">No similar tickets found based on your description.</p>'
    return
  }

  suggestions.forEach((ticket) => {
    const suggestionElement = document.createElement("div")
    suggestionElement.className = "suggestion-item"
    suggestionElement.dataset.ticketId = ticket.id
    suggestionElement.innerHTML = `
      <div class="suggestion-content">
        <div class="suggestion-header">
          <span class="ticket-id">${ticket.id}</span>
          <span class="ticket-status ${ticket.status}">${formatStatus(ticket.status)}</span>
        </div>
        <div class="suggestion-summary">${ticket.summary}</div>
        <div class="suggestion-assignee">
          <div class="avatar">${ticket.assigneeInitials || "UN"}</div>
          <span>${ticket.assignee || "Unassigned"} - ${ticket.resolutionTime || "~0h"}</span>
        </div>
      </div>
    `

    // Add click handler to open ticket details in same tab
    suggestionElement.addEventListener("click", () => {
      openTicketDetailsPage(ticket)
    })

    suggestionsContainer.appendChild(suggestionElement)
  })
}

// Handle create incident form submission
function handleCreateIncident(e) {
  e.preventDefault()

  const formData = new FormData(e.target)
  const incidentData = {
    title: formData.get("title"),
    description: formData.get("description"),
    priority: formData.get("priority"),
    department: formData.get("department"),
    assignee: formData.get("assignee") || "Auto-assigned",
    affectedArea: formData.get("affectedArea") || "General",
  }

  // Generate new ticket ID
  const newTicketId = `TCK-${Math.floor(Math.random() * 9000) + 1000}`

  // Get assignee initials
  const assigneeInitials =
    incidentData.assignee === "Auto-assigned"
      ? "AA"
      : incidentData.assignee
          .split(" ")
          .map((name) => name[0])
          .join("")

  // Create new ticket object
  const newTicket = {
    id: newTicketId,
    summary: incidentData.title,
    status: "defined",
    urgency: incidentData.priority,
    assignee: incidentData.assignee,
    assigneeInitials: assigneeInitials,
    resolutionTime: "~TBD",
    tags: [incidentData.department],
    isDead: false,
    description: incidentData.description,
    predictedTeam: `${incidentData.department} Development`,
    estimatedDuration: "~TBD",
    classification: `${incidentData.priority.charAt(0).toUpperCase() + incidentData.priority.slice(1)} Priority`,
    affectedArea: incidentData.affectedArea,
    longResolution: false,
  }

  // Add to tickets data
  ticketsData.unshift(newTicket)

  // Re-render tickets
  renderTickets()

  // Close modal
  closeCreateIncidentModal()

  // Show success message
  showNotification(`Incident ${newTicketId} created successfully!`)
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.createElement("div")
  notification.className = `notification ${type}`
  notification.textContent = message

  const bgColor = type === "error" ? "#ef4444" : "#10b981"

  notification.style.cssText = `
    position: fixed;
    top: 80px;
    right: 24px;
    background: ${bgColor};
    color: white;
    padding: 12px 20px;
    border-radius: 6px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    z-index: 4000;
    font-size: 14px;
    font-weight: 500;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 300px;
  `

  document.body.appendChild(notification)

  // Animate in
  setTimeout(() => {
    notification.style.transform = "translateX(0)"
  }, 100)

  // Remove after duration
  const duration = type === "error" ? 4000 : 3000
  setTimeout(() => {
    notification.style.transform = "translateX(100%)"
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 300)
  }, duration)
}

// Initialize dashboard when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  initDashboard()
  initMultiStepForm()

  // Add click event to the "My Dashboard" nav item
  const myDashboardNavItem = document.querySelector('.nav-item[data-tooltip="My Dashboard"]')
  if (myDashboardNavItem) {
    myDashboardNavItem.addEventListener("click", () => {
      window.location.href = "user-dashboard.html"
    })
  }

  // Add click event to the "Dashboard" nav item to go back to main dashboard
  const dashboardNavItem = document.querySelector('.nav-item[data-tooltip="Dashboard"]')
  if (dashboardNavItem) {
    dashboardNavItem.addEventListener("click", () => {
      window.location.href = "index.html"
    })
  }
})

// Handle responsive behavior
window.addEventListener("resize", () => {
  if (window.innerWidth <= 992) {
    if (sidebar) sidebar.classList.add("collapsed")
  }
})

// Export functions for use in other files
window.dashboardFunctions = {
  openTicketDetailsPage,
  generateSmartSuggestions,
  setupEventListeners,
}

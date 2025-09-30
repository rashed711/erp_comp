
document.addEventListener('DOMContentLoaded', () => {
    // User Menu Dropdown
    const userMenuButton = document.getElementById('user-menu-button');
    const userMenu = document.getElementById('user-menu');
    const userMenuChevron = document.getElementById('user-menu-chevron');
    const userMenuContainer = document.getElementById('user-menu-container');

    if (userMenuButton && userMenu && userMenuContainer) {
        userMenuButton.addEventListener('click', (event) => {
            event.stopPropagation();
            userMenu.classList.toggle('hidden');
            if(userMenuChevron) userMenuChevron.classList.toggle('rotate-180');
        });

        document.addEventListener('click', (event) => {
            if (userMenu && !userMenu.classList.contains('hidden') && !userMenuContainer.contains(event.target)) {
                userMenu.classList.add('hidden');
                if(userMenuChevron) userMenuChevron.classList.remove('rotate-180');
            }
        });
    }
    
    // Mobile Sidebar
    const sidebar = document.getElementById('sidebar');
    const openSidebarBtn = document.getElementById('open-sidebar-btn');
    const closeSidebarBtn = document.getElementById('close-sidebar-btn');
    const backdrop = document.getElementById('sidebar-backdrop');

    const openSidebar = () => {
        if (sidebar && backdrop) {
            sidebar.classList.remove('translate-x-full');
            backdrop.classList.remove('hidden');
        }
    };

    const closeSidebar = () => {
        if (sidebar && backdrop) {
            sidebar.classList.add('translate-x-full');
            backdrop.classList.add('hidden');
        }
    };

    if (openSidebarBtn) openSidebarBtn.addEventListener('click', openSidebar);
    if (closeSidebarBtn) closeSidebarBtn.addEventListener('click', closeSidebar);
    if (backdrop) backdrop.addEventListener('click', closeSidebar);

    // Sidebar Submenu Toggle
    document.querySelectorAll('.nav-item > button').forEach(button => {
        button.addEventListener('click', () => {
            const submenu = button.nextElementSibling;
            const chevron = button.querySelector('.chevron-icon');
            
            if (submenu.classList.contains('hidden')) {
                submenu.classList.remove('hidden');
                if(chevron) chevron.classList.add('rotate-180');
            } else {
                submenu.classList.add('hidden');
                if(chevron) chevron.classList.remove('rotate-180');
            }
        });
    });

    // Sales Chart (Chart.js)
    const salesChartCanvas = document.getElementById('salesChart');
    if (salesChartCanvas && typeof salesData !== 'undefined' && typeof Chart !== 'undefined') {
        const ctx = salesChartCanvas.getContext('2d');
        
        const labels = salesData.map(d => d.month);
        const salesValues = salesData.map(d => d.sales);
        const purchasesValues = salesData.map(d => d.purchases);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'المبيعات',
                        data: salesValues,
                        backgroundColor: '#4f46e5',
                        borderColor: '#4f46e5',
                        borderWidth: 1,
                        borderRadius: { topRight: 4, topLeft: 4 }
                    },
                    {
                        label: 'المشتريات',
                        data: purchasesValues,
                        backgroundColor: '#a78bfa',
                        borderColor: '#a78bfa',
                        borderWidth: 1,
                        borderRadius: { topRight: 4, topLeft: 4 }
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: '#e5e7eb'
                        },
                        ticks: {
                            color: '#6B7280',
                            callback: function(value) {
                                return value / 1000 + 'k';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#6B7280'
                        }
                    }
                },
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#374151',
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        },
                        rtl: true,
                    },
                    tooltip: {
                        direction: 'rtl',
                        backgroundColor: '#ffffff',
                        titleColor: '#374151',
                        bodyColor: '#6B7280',
                        borderColor: '#e5e7eb',
                        borderWidth: 1
                    }
                }
            }
        });
    }
});
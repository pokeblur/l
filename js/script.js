// Datos de los pesajes
const weighings = [
    {
        date: '2025-09-30',
        weight: 102.3,
        bmi: 33.8,
        bodyFat: 34.3,
        muscle: 31.9,
        visceralFat: 14,
        bodyAge: 64
    },
    {
        date: '2025-10-05',
        weight: 101.3,
        bmi: 33.5,
        bodyFat: 36.9,
        muscle: 30.3,
        visceralFat: 15,
        bodyAge: 64
    },
    {
        date: '2025-10-10',
        weight: 100.8,
        bmi: 33.3,
        bodyFat: 36.7,
        muscle: 30.4,
        visceralFat: 15.0,
        bodyAge: 64
    }
];

// Formatear fecha
function formatDate(dateString) {
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}

// Crear tarjetas de pesajes
function createWeighingCards() {
    const container = document.getElementById('weighingsContainer');
    
    weighings.forEach((weighing) => {
        const card = document.createElement('div');
        card.className = 'weighing-card';
        
        card.innerHTML = `
            <div class="weighing-header">
                <div class="weighing-date">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${formatDate(weighing.date)}</span>
                </div>
                <div class="weighing-weight">
                    <span class="weighing-weight-value">${weighing.weight}</span>
                    <span class="weighing-weight-unit">kg</span>
                </div>
            </div>
            <div class="weighing-metrics">
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">BMI</p>
                        <p class="weighing-metric-value">${weighing.bmi}</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Grasa Corporal</p>
                        <p class="weighing-metric-value">${weighing.bodyFat}%</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Músculo</p>
                        <p class="weighing-metric-value">${weighing.muscle}%</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Grasa Visceral</p>
                        <p class="weighing-metric-value">${weighing.visceralFat}</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Edad Corporal</p>
                        <p class="weighing-metric-value">${weighing.bodyAge}</p>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// Variables globales para el gráfico
let chartPoints = [];
let chartConfig = {};
let activeTooltipPoint = null;

// Crear tooltip
function createTooltip() {
    let tooltip = document.getElementById('chartTooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.id = 'chartTooltip';
        tooltip.style.cssText = `
            position: absolute;
            background: rgba(20, 30, 48, 0.95);
            border: 1px solid hsl(48, 100%, 50%);
            border-radius: 8px;
            padding: 12px;
            color: white;
            font-size: 14px;
            pointer-events: none;
            opacity: 0;
            display: none;
            z-index: 1000;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
            transition: opacity 0.3s ease-out, transform 0.3s ease-out;
            transform: translateY(-5px);
        `;
        document.body.appendChild(tooltip);
    }
    return tooltip;
}

// Mostrar tooltip
function showTooltip(canvasX, canvasY, data) {
    const tooltip = createTooltip();
    const canvas = document.getElementById('weightChart');
    const rect = canvas.getBoundingClientRect();
    
    const formattedDate = new Date(data.date).toLocaleDateString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric' 
    });
    
    tooltip.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 8px; color: hsl(48, 100%, 50%);">
            ${formattedDate}
        </div>
        <div style="margin-bottom: 4px;">
            <strong>Peso:</strong> ${data.weight} kg
        </div>
        <div>
            <strong>Objetivo:</strong> ${chartConfig.goalWeight} kg
        </div>
    `;
    
    tooltip.style.display = 'block';
    
    // Posicionar el tooltip debajo del punto
    const absoluteX = rect.left + canvasX + window.scrollX;
    const absoluteY = rect.top + canvasY + window.scrollY;
    
    // Centrar horizontalmente y colocar debajo del punto
    tooltip.style.left = (absoluteX - tooltip.offsetWidth / 2) + 'px';
    tooltip.style.top = (absoluteY + 15) + 'px';
    
    // Animar la aparición
    setTimeout(() => {
        tooltip.style.opacity = '1';
        tooltip.style.transform = 'translateY(0)';
    }, 10);
    
    activeTooltipPoint = data;
}

// Ocultar tooltip
function hideTooltip() {
    const tooltip = document.getElementById('chartTooltip');
    if (tooltip) {
        tooltip.style.opacity = '0';
        tooltip.style.transform = 'translateY(-5px)';
        setTimeout(() => {
            tooltip.style.display = 'none';
        }, 300);
    }
    activeTooltipPoint = null;
}

// Crear gráfica simple con Canvas
function createChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.offsetWidth;
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    const chartData = [
        { date: '2025-09-25', weight: 103.2 },
        ...weighings.map(w => ({ date: w.date, weight: w.weight }))
    ];
    
    const goalWeight = 85.0;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Guardar configuración global
    chartConfig = {
        width,
        height,
        padding,
        chartWidth,
        chartHeight,
        goalWeight,
        chartData
    };
    
    // Encontrar min y max para escala
    const weights = chartData.map(d => d.weight);
    const maxWeight = Math.max(...weights, goalWeight) + 2;
    const minWeight = Math.min(...weights, goalWeight) - 2;
    const weightRange = maxWeight - minWeight;
    
    chartConfig.minWeight = minWeight;
    chartConfig.weightRange = weightRange;
    
    // Fondo
    ctx.fillStyle = 'rgba(41, 57, 89, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Línea de objetivo
    const goalY = padding + chartHeight - ((goalWeight - minWeight) / weightRange * chartHeight);
    ctx.strokeStyle = 'rgba(250, 215, 7, 0.3)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(padding, goalY);
    ctx.lineTo(width - padding, goalY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Etiqueta objetivo
    ctx.fillStyle = 'hsl(48, 100%, 50%)';
    ctx.font = '12px sans-serif';
    ctx.fillText(`Objetivo: ${goalWeight} kg`, width - padding - 120, goalY - 10);
    
    // Línea de peso
    ctx.strokeStyle = 'hsl(48, 100%, 50%)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    chartData.forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.weight - minWeight) / weightRange * chartHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();
    
    // Guardar posiciones de puntos y dibujar
    chartPoints = [];
    chartData.forEach((point, index) => {
        const x = padding + (index / (chartData.length - 1)) * chartWidth;
        const y = padding + chartHeight - ((point.weight - minWeight) / weightRange * chartHeight);
        
        chartPoints.push({
            x,
            y,
            data: point
        });
        
        // Punto
        ctx.fillStyle = 'hsl(48, 100%, 50%)';
        ctx.beginPath();
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();
        
        // Fecha
        ctx.fillStyle = 'hsl(48, 80%, 80%)';
        ctx.font = '11px sans-serif';
        ctx.save();
        ctx.translate(x, height - padding + 20);
        ctx.rotate(-Math.PI / 4);
        ctx.fillText(point.date, 0, 0);
        ctx.restore();
        
        // Peso
        ctx.fillStyle = 'hsl(48, 100%, 98%)';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(`${point.weight} kg`, x - 20, y - 10);
    });
    
    // Ejes
    ctx.strokeStyle = 'hsl(48, 80%, 40%)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(padding, padding);
    ctx.lineTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.stroke();
}

// Event listeners para el canvas
function setupChartInteractions() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    // Click event
    canvas.addEventListener('click', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Buscar punto cercano
        const clickRadius = 15;
        for (const point of chartPoints) {
            const distance = Math.sqrt(
                Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
            );
            
            if (distance <= clickRadius) {
                // Si el mismo punto está activo, ocultarlo
                if (activeTooltipPoint && activeTooltipPoint.date === point.data.date) {
                    hideTooltip();
                } else {
                    // Mostrar tooltip del nuevo punto
                    showTooltip(point.x, point.y, point.data);
                }
                return;
            }
        }
        
        // Si se hace clic fuera de los puntos, ocultar tooltip
        if (activeTooltipPoint) {
            hideTooltip();
        }
    });
    
    // Hover effect
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const hoverRadius = 15;
        let hovering = false;
        
        for (const point of chartPoints) {
            const distance = Math.sqrt(
                Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2)
            );
            
            if (distance <= hoverRadius) {
                hovering = true;
                canvas.style.cursor = 'pointer';
                break;
            }
        }
        
        if (!hovering) {
            canvas.style.cursor = 'default';
        }
    });
    
    // Ocultar tooltip al salir del canvas
    canvas.addEventListener('mouseleave', () => {
        canvas.style.cursor = 'default';
    });
}

// Animaciones de entrada
function animateOnScroll() {
    const elements = document.querySelectorAll('.card, .metric-card, .weighing-card');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '0';
                entry.target.style.transform = 'translateY(20px)';
                
                setTimeout(() => {
                    entry.target.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    elements.forEach(el => observer.observe(el));
}

// Animación de fade-in para el hero
function animateHero() {
    const hero = document.querySelector('.hero-content');
    const logo = document.querySelector('.logo');
    
    if (hero) {
        hero.style.opacity = '0';
        hero.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            hero.style.transition = 'opacity 0.8s ease-out, transform 0.8s ease-out';
            hero.style.opacity = '1';
            hero.style.transform = 'translateY(0)';
        }, 100);
    }
    
    if (logo) {
        logo.style.opacity = '0';
        logo.style.transform = 'scale(0.8)';
        
        setTimeout(() => {
            logo.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
            logo.style.opacity = '1';
            logo.style.transform = 'scale(1)';
        }, 300);
    }
}

// Animación del gráfico (dibujado progresivo)
function animateChart() {
    const canvas = document.getElementById('weightChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.parentElement.offsetWidth;
    const height = 400;
    
    canvas.width = width;
    canvas.height = height;
    
    const chartData = [
        { date: '2025-09-25', weight: 103.2 },
        ...weighings.map(w => ({ date: w.date, weight: w.weight }))
    ];
    
    const goalWeight = 85.0;
    const padding = 60;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;
    
    // Guardar configuración global
    chartConfig = {
        width,
        height,
        padding,
        chartWidth,
        chartHeight,
        goalWeight,
        chartData
    };
    
    const weights = chartData.map(d => d.weight);
    const maxWeight = Math.max(...weights, goalWeight) + 2;
    const minWeight = Math.min(...weights, goalWeight) - 2;
    const weightRange = maxWeight - minWeight;
    
    chartConfig.minWeight = minWeight;
    chartConfig.weightRange = weightRange;
    
    let progress = 0;
    const duration = 1500; // 1.5 segundos
    const startTime = Date.now();
    
    function drawFrame() {
        const elapsed = Date.now() - startTime;
        progress = Math.min(elapsed / duration, 1);
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Fondo
        ctx.fillStyle = 'rgba(41, 57, 89, 0.3)';
        ctx.fillRect(0, 0, width, height);
        
        // Línea de objetivo
        const goalY = padding + chartHeight - ((goalWeight - minWeight) / weightRange * chartHeight);
        ctx.strokeStyle = 'rgba(250, 215, 7, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(padding, goalY);
        ctx.lineTo(width - padding, goalY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Etiqueta objetivo
        ctx.fillStyle = 'hsl(48, 100%, 50%)';
        ctx.font = '12px sans-serif';
        ctx.fillText(`Objetivo: ${goalWeight} kg`, width - padding - 120, goalY - 10);
        
        // Calcular cuántos puntos dibujar según el progreso
        const pointsToDraw = Math.ceil(chartData.length * progress);
        
        // Línea de peso (progresiva)
        if (pointsToDraw > 1) {
            ctx.strokeStyle = 'hsl(48, 100%, 50%)';
            ctx.lineWidth = 3;
            ctx.beginPath();
            
            for (let i = 0; i < pointsToDraw; i++) {
                const point = chartData[i];
                const x = padding + (i / (chartData.length - 1)) * chartWidth;
                const y = padding + chartHeight - ((point.weight - minWeight) / weightRange * chartHeight);
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.stroke();
        }
        
        // Puntos y etiquetas
        chartPoints = [];
        for (let i = 0; i < pointsToDraw; i++) {
            const point = chartData[i];
            const x = padding + (i / (chartData.length - 1)) * chartWidth;
            const y = padding + chartHeight - ((point.weight - minWeight) / weightRange * chartHeight);
            
            // Guardar posición del punto
            if (progress >= 1) {
                chartPoints.push({
                    x,
                    y,
                    data: point
                });
            }
            
            // Punto con efecto de aparición
            const pointAlpha = i === pointsToDraw - 1 ? progress * chartData.length - (pointsToDraw - 1) : 1;
            ctx.fillStyle = `hsla(48, 100%, 50%, ${pointAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            // Fecha
            ctx.fillStyle = `hsla(48, 80%, 80%, ${pointAlpha})`;
            ctx.font = '11px sans-serif';
            ctx.save();
            ctx.translate(x, height - padding + 20);
            ctx.rotate(-Math.PI / 4);
            ctx.fillText(point.date, 0, 0);
            ctx.restore();
            
            // Peso
            ctx.fillStyle = `hsla(48, 100%, 98%, ${pointAlpha})`;
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(`${point.weight} kg`, x - 20, y - 10);
        }
        
        // Ejes
        ctx.strokeStyle = 'hsl(48, 80%, 40%)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(padding, padding);
        ctx.lineTo(padding, height - padding);
        ctx.lineTo(width - padding, height - padding);
        ctx.stroke();
        
        // Continuar animación
        if (progress < 1) {
            requestAnimationFrame(drawFrame);
        } else {
            // Una vez terminada la animación, configurar interacciones
            setupChartInteractions();
        }
    }
    
    drawFrame();
}

// Animación de contadores numéricos
function animateCounters() {
    const counters = document.querySelectorAll('.metric-value, .weight-value');
    
    counters.forEach(counter => {
        const target = parseFloat(counter.textContent);
        const duration = 1000;
        const steps = 60;
        const stepValue = target / steps;
        let current = 0;
        let step = 0;
        
        const timer = setInterval(() => {
            step++;
            current += stepValue;
            
            if (step >= steps) {
                counter.textContent = target.toFixed(1);
                clearInterval(timer);
            } else {
                counter.textContent = current.toFixed(1);
            }
        }, duration / steps);
    });
}

// Crear tarjetas con animación escalonada
function createWeighingCardsAnimated() {
    const container = document.getElementById('weighingsContainer');
    
    weighings.forEach((weighing, index) => {
        const card = document.createElement('div');
        card.className = 'weighing-card';
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        card.innerHTML = `
            <div class="weighing-header">
                <div class="weighing-date">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                        <line x1="16" y1="2" x2="16" y2="6"></line>
                        <line x1="8" y1="2" x2="8" y2="6"></line>
                        <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>${formatDate(weighing.date)}</span>
                </div>
                <div class="weighing-weight">
                    <span class="weighing-weight-value">${weighing.weight}</span>
                    <span class="weighing-weight-unit">kg</span>
                </div>
            </div>
            <div class="weighing-metrics">
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">BMI</p>
                        <p class="weighing-metric-value">${weighing.bmi}</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Grasa Corporal</p>
                        <p class="weighing-metric-value">${weighing.bodyFat}%</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Músculo</p>
                        <p class="weighing-metric-value">${weighing.muscle}%</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Grasa Visceral</p>
                        <p class="weighing-metric-value">${weighing.visceralFat}</p>
                    </div>
                </div>
                <div class="weighing-metric">
                    <svg class="weighing-metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <div>
                        <p class="weighing-metric-label">Edad Corporal</p>
                        <p class="weighing-metric-value">${weighing.bodyAge}</p>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(card);
        
        // Animar con delay escalonado
        setTimeout(() => {
            card.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
        }, 100 * index);
    });
}

// Inicializar cuando cargue la página
window.addEventListener('load', () => {
    animateHero();
    setTimeout(() => {
        animateCounters();
    }, 300);
    createWeighingCardsAnimated();
    setTimeout(() => {
        animateChart();
    }, 500);
    animateOnScroll();
});

// Redimensionar gráfica sin animación
window.addEventListener('resize', () => {
    hideTooltip();
    createChart();
    setupChartInteractions();
});


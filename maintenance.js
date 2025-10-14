// Maintenance mode handler
(function() {
    // Check if maintenance mode is enabled
    if (window.ENV && window.ENV.MAINTENANCE_MODE === true) {
        // Immediately replace the page with maintenance page on load
        const showMaintenancePage = function() {
            document.open();
            document.write(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Under Maintenance</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: #0a0a0a;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            overflow: hidden;
        }
        .maintenance-container {
            text-align: center;
            color: #e0e0e0;
            padding: 40px;
            max-width: 500px;
            animation: fadeIn 0.8s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .icon {
            width: 80px;
            height: 80px;
            margin: 0 auto 30px;
            border: 3px solid #3b82f6;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 36px;
            animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
            0%, 100% { 
                transform: scale(1);
                border-color: #3b82f6;
            }
            50% { 
                transform: scale(1.05);
                border-color: #60a5fa;
            }
        }
        h1 {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #ffffff;
            letter-spacing: -0.5px;
        }
        p {
            font-size: 16px;
            font-weight: 400;
            color: #9ca3af;
            line-height: 1.6;
            margin-bottom: 40px;
        }
        .status-bar {
            width: 200px;
            height: 4px;
            background: #1f1f1f;
            border-radius: 2px;
            margin: 0 auto;
            overflow: hidden;
        }
        .status-bar::after {
            content: '';
            display: block;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, #3b82f6, #60a5fa);
            animation: loading 1.5s ease-in-out infinite;
        }
        @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
        }
    </style>
</head>
<body>
    <div class="maintenance-container">
        <div class="icon">⚙️</div>
        <h1>Under Maintenance</h1>
        <p>
            I am making some improvements.<br>
            I'll be back shortly.
        </p>
        <div class="status-bar"></div>
    </div>
</body>
</html>
            `);
            document.close();
        };
        
        // Show maintenance page immediately if DOM is already loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', showMaintenancePage);
        } else {
            showMaintenancePage();
        }
    }
})();

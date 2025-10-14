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
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Rajdhani', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            overflow: hidden;
        }
        .maintenance-container {
            text-align: center;
            color: white;
            padding: 40px;
            max-width: 600px;
            animation: fadeIn 0.5s ease-in;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .icon {
            font-size: 72px;
            margin-bottom: 20px;
            animation: bounce 2s infinite;
        }
        @keyframes bounce {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
        }
        h1 {
            font-size: 48px;
            font-weight: 700;
            margin-bottom: 20px;
            letter-spacing: 2px;
        }
        p {
            font-size: 20px;
            font-weight: 400;
            margin-bottom: 30px;
            opacity: 0.9;
            line-height: 1.6;
        }
        .footer {
            font-size: 16px;
            opacity: 0.7;
            margin-top: 40px;
        }
    </style>
</head>
<body>
    <div class="maintenance-container">
        <div class="icon">🔧</div>
        <h1>Under Maintenance</h1>
        <p>
            We're currently performing scheduled maintenance to improve your experience.
            <br>
            Please check back soon!
        </p>
        <div class="footer">
            &copy; ${new Date().getFullYear()} Praveen Ganapathy Ravi
        </div>
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

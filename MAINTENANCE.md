# Website Maintenance Mode Toggle

This portfolio website includes a maintenance mode feature that allows you to quickly turn the website on or off.

## How to Use

### Turning the Website OFF (Maintenance Mode)

1. Open the `env-config.js` file
2. Find the `MAINTENANCE_MODE` setting
3. Change it from `false` to `true`:
   ```javascript
   MAINTENANCE_MODE: true
   ```
4. Save the file
5. Commit and push the changes to your repository

When maintenance mode is enabled, visitors will see a professional maintenance page instead of your portfolio.

### Turning the Website ON

1. Open the `env-config.js` file
2. Find the `MAINTENANCE_MODE` setting
3. Change it from `true` to `false`:
   ```javascript
   MAINTENANCE_MODE: false
   ```
4. Save the file
5. Commit and push the changes to your repository

The portfolio will be fully accessible again.

## What Happens in Maintenance Mode?

When `MAINTENANCE_MODE: true`:
- All visitors see a beautiful maintenance page
- The maintenance page shows:
  - A clear "Under Maintenance" message
  - Information that the site is undergoing scheduled maintenance
  - Your copyright notice
- All portfolio content is hidden
- All scripts and styles are disabled (except maintenance mode)

## Quick Toggle Command

You can use these git commands to quickly toggle maintenance mode:

```bash
# Turn OFF the website (enable maintenance mode)
sed -i 's/MAINTENANCE_MODE: false/MAINTENANCE_MODE: true/' env-config.js && git add env-config.js && git commit -m "Enable maintenance mode" && git push

# Turn ON the website (disable maintenance mode)
sed -i 's/MAINTENANCE_MODE: true/MAINTENANCE_MODE: false/' env-config.js && git add env-config.js && git commit -m "Disable maintenance mode" && git push
```

## Files Involved

- **env-config.js**: Contains the `MAINTENANCE_MODE` configuration flag
- **maintenance.js**: Script that checks the flag and displays the maintenance page if needed
- **index.html**: Updated to load the configuration and maintenance scripts

## Notes

- Changes take effect immediately after pushing to your GitHub repository (if using GitHub Pages)
- The maintenance page is mobile-responsive and looks good on all devices
- The maintenance page uses a gradient background matching your brand colors

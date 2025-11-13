# DevExtreme License Setup

JobEval uses [DevExtreme](https://js.devexpress.com/) components for advanced data grids and UI features. DevExtreme is a commercial library that requires a license key.

## For Project Maintainers

If you have purchased a DevExtreme license:

1. The license file `src/devextreme-license.ts` should already exist with your key
2. This file is git-ignored and will never be committed to version control
3. Your license key is automatically loaded in `src/main.tsx`

## For Contributors

If you're contributing to JobEval and need to run the application locally, you have several options:

### Option 1: 30-Day Trial (Recommended for Contributors)

1. Visit the [DevExtreme Download page](https://js.devexpress.com/Download/)
2. Register for a free 30-day trial
3. Copy your trial license key from the DevExpress Download Manager
4. Create the license file:
   ```bash
   cp src/devextreme-license.ts.template src/devextreme-license.ts
   ```
5. Edit `src/devextreme-license.ts` and replace `YOUR_LICENSE_KEY_HERE` with your actual key

### Option 2: Request Development Access

For long-term contributors or those unable to use the trial:

1. Contact the project maintainer via GitHub Issues
2. Request access to a development license key
3. We maintain a shared development key for active contributors

### Option 3: Work Without DevExtreme Features

If you're working on features that don't require DevExtreme:

1. Comment out the DevExtreme import and configuration in `src/main.tsx`
2. Avoid using DevExtreme components in your work
3. Your changes will still build and run (with console warnings)

## CI/CD Integration

For GitHub Actions and other CI systems:

- The project uses a `DEVEXTREME_KEY` secret stored in GitHub repository settings
- This is automatically loaded during CI builds
- Contributors don't need to configure this

## Security Note

⚠️ **Never commit your license key to version control!**

The file `src/devextreme-license.ts` is already listed in `.gitignore`. DevExtreme license keys are public in client-side JavaScript applications, but we keep them out of version control as a best practice and to prevent accidental exposure of the license holder's information.

## Questions?

If you have questions about DevExtreme licensing or setup:

1. Check the [DevExtreme Licensing Documentation](https://js.devexpress.com/jQuery/Documentation/Guide/Common/Licensing/)
2. Open an issue on GitHub
3. Contact the project maintainer

## License Compliance

JobEval's use of DevExtreme complies with DevExpress licensing terms:

- The project maintainer holds a valid commercial license
- Contributors can use trial licenses for development
- The application is licensed under AGPL-3.0 for SMEs and non-profits
- Commercial licensing available for enterprise deployments

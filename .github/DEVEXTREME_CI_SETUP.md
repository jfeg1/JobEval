# GitHub Actions Setup for DevExtreme

This guide explains how to configure GitHub Actions to work with DevExtreme licensing for CI/CD builds.

## Overview

JobEval's CI/CD pipeline requires a valid DevExtreme license key to build successfully. The license key is stored as a GitHub repository secret and automatically injected during the build process.

## Setting Up the GitHub Secret

### For Repository Maintainers

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click on **Settings** (requires admin access)
   - In the left sidebar, click **Secrets and variables** → **Actions**

2. **Create the Secret**
   - Click **New repository secret**
   - Name: `DEVEXTREME_KEY`
   - Value: Paste your DevExtreme license key
   - Click **Add secret**

3. **Verify the Secret**
   - The secret should now appear in your list (the value will be hidden)
   - Name: `DEVEXTREME_KEY`
   - Updated: [timestamp]

## How It Works

### Automatic License Injection

The CI/CD workflow (`.github/workflows/ci.yml`) includes:

```yaml
env:
  DEVEXTREME_KEY: ${{ secrets.DEVEXTREME_KEY }}
```

This makes the license key available as an environment variable during the build.

### Build Process

1. **npm ci** runs and installs dependencies
2. **postinstall script** automatically executes `scripts/setup-devextreme-license.js`
3. **Script checks** for `DEVEXTREME_KEY` environment variable
4. **If found**, creates `src/devextreme-license.ts` with the key
5. **Build continues** with proper licensing

### Security Features

✅ **Secret is encrypted** - GitHub encrypts secrets at rest and in transit
✅ **Hidden in logs** - The secret value is masked in workflow logs
✅ **No commits** - The license file is never committed to the repository
✅ **Access controlled** - Only repository admins can view/edit secrets

## Troubleshooting

### Build Fails with License Error

**Symptom:** CI build fails with DevExtreme license validation errors

**Solution:**
1. Verify the `DEVEXTREME_KEY` secret exists in repository settings
2. Check that the secret name is exactly `DEVEXTREME_KEY` (case-sensitive)
3. Ensure the license key is valid and not expired
4. Try updating the secret with a fresh copy of the key

### Secret Not Available

**Symptom:** Warning about missing DEVEXTREME_KEY during build

**Possible Causes:**
- Secret not created in repository settings
- Workflow running on a fork (secrets don't transfer to forks)
- Incorrect secret name

**Solution:**
- For repository maintainers: Add the secret as described above
- For contributors: Fork workflows won't have access; this is expected

### License Key Expired

**Symptom:** Build fails with "license key has expired" error

**Solution:**
1. Log into [DevExpress Download Manager](https://www.devexpress.com/ClientCenter/DownloadManager/)
2. Get the updated license key for your version
3. Update the GitHub secret with the new key

## For Contributors

### Pull Requests from Forks

When you submit a pull request from a fork:

- **Secrets are not available** to fork workflows (GitHub security policy)
- **CI builds will fail** if they require DevExtreme components
- **This is expected** and won't block your PR

### What to Do

1. **Don't worry about CI failures** on your fork
2. **Mention in your PR** that CI will need to run from the main repo
3. **Maintainers will test** your PR after reviewing the code
4. **Alternative:** Request collaborator access if you're a regular contributor

## Maintaining Multiple Licenses

### If Your Organization Has Multiple Licenses

According to DevExpress licensing:

- You can use **any valid license key** issued to you or your developers
- **CI doesn't need a dedicated key** if all developers have licenses
- **One key works** for all CI builds (it's not device-specific)

### Recommended Approach

- Use a **team-shared license key** if available
- **Don't tie to a specific developer** who might leave
- **Document who owns** the license in your internal wiki
- **Update the secret** when renewing licenses

## Security Best Practices

### Do's ✅

- Store the key as a GitHub secret
- Use environment variables for license injection
- Keep the license file in `.gitignore`
- Rotate keys when team members with access leave
- Document the setup process for future maintainers

### Don'ts ❌

- Never commit license keys to the repository
- Don't hardcode keys in workflow files
- Don't share keys in pull request comments
- Don't store keys in wiki or documentation
- Don't expose keys in build logs or error messages

## Related Documentation

- [DevExtreme Licensing Guide](https://js.devexpress.com/jQuery/Documentation/Guide/Common/Licensing/)
- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/using-secrets-in-github-actions)
- [DevExtreme Setup Guide](./DEVEXTREME_SETUP.md)

## Questions?

For issues related to:

- **GitHub Actions setup:** Open an issue in the repository
- **DevExtreme licensing:** Contact [DevExpress Support](https://www.devexpress.com/support/center)
- **License key problems:** Check [DevExpress Download Manager](https://www.devexpress.com/ClientCenter/DownloadManager/)

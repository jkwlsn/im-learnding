---
title: "Setting up Jenkins email notifications"
tags:
    - Jenkins
    - Email
    - Continuous Integration
    - Continuous Deployment
---
## Configuring notifications

With the `Github -> Jenkins -> S3` pipeline working. I thought that I could improve the Developer Experience with some email notifications. I searched for some guide and found a fw easy-to-follow ones.

https://navyadevops.hashnode.dev/setting-up-email-notifications-in-jenkins-step-by-step-guide#heading-step-1-install-email-extension-plugin
https://medium.com/@mkhanops/setting-up-email-notifications-for-jenkins-jobs-c35a1248f552

I went with plaintext emails because [emails should be plaintext](https://useplaintext.email/).

I used the email-ext plugin as it was recommended.

I followed tutorials and advice online to get it running.

I set my Gmail SMTP settings.

I added a config section to the Jenkinsfile, just below the `agents any` line:

```jenkinsfile
post {
        always {
            emailext (
                to: "${env.EMAIL}",
                from: 'jenkins@jacobcharleswilson.com',
                subject: '$DEFAULT_SUBJECT',
                body: '$DEFAULT_CONTENT',
                attachLog: true
            )
        }
    }
```

This sends an email after every job, whether its succeeded or failed, detailing the job, build number, and status. In the body of the email it contains a URL to the job and an attachment of the `build.log` file.

I set the `$DEFAULT_SUBJECT` to: `JENKINS - $BUILD_STATUS - $PROJECT_NAME - Build $BUILD_NUMBER` for readability.

I set the default body to:

```
JENKINS - $BUILD_STATUS - $PROJECT_NAME - Build $BUILD_NUMBER

Check console output at $BUILD_URL to view the results.
```

I triggered another build, and within seconds had an email in my inbox. I trigged a deliberate failure, and was notified immediately.

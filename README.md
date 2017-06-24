# dmail - Send Sumo Logic dashboards via email (Support AWS SES)

A simple hack to capture a screenshot of a Sumo Logic dashboard, which is then embedded into an email.

Here is a quick teaser:

![Teaser](images/sample.png)

## Installation

On my Ubuntu box (running Vivid) this worked:

```bash
git clone https://github.com/SumoLogic/dmail.git
cd dmail/
curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
sudo apt-get install -y nodejs
npm install
```

This link was helpful: https://nodejs.org/en/download/package-manager/

I also have it working on my Mac, but forgot to take notes on the installation. `npm install` might be all that's required tho. Happy to add instructions here if somebody wants to submit a PR.

You may need to install libfontconfig :
```bash
sudo apt-get install libfontconfig
```

## Run

Simple - run `bin/dmail` with a giant commandline :)

Here's what I do:

```bash
bin/dmail -u [user] -p [password] -d us2 --dashboard-id 'AWWmr1w65OKhIp9Y0lU0QYvwhoranel75MpZmqZt8hARxm4kcfrG6hD0G4us' \
          --mail-user [mail-user] --mail-password [mail-password] --mail-host smtp.gmail.com \
          -r christian@sumologic.com \
          -s john@sumologic.com \
          --mail-subject "[DMAIL] Search Summary Last 7 Day"
```

For SES:

```bash
bin/dmail -u [user] -p [password] -d us2 --dashboard-id 'AWWmr1w65OKhIp9Y0lU0QYvwhoranel75MpZmqZt8hARxm4kcfrG6hD0G4us' \
          --mail-user [mail-user] --mail-password [mail-password] \
          -r christian@sumologic.com \
          -s john@sumologic.com \
          --mail-subject "[DMAIL] Search Summary Last 7 Day" \
          --region 'us-east-1' \
          --ses
```

Here's the full explanation of the commandline arguments. Note that all parameters are required!

```
  Usage: dmail [options]

  Options:

    -h, --help                      output usage information
    -V, --version                   output the version number
    -u, --user <user>               user to log in as to Sumo Logic
    -p, --password <password>       password for logging in
    -d, --deployment <deployment>   name of the Sumo Logic deployment for logging in
    --dashboard-id <dashboardId>    ID of the dashboard to email
    --mail-user <mailUser>          mail user to log in as or access key
    --mail-password <mailPassword>  password of the mail user or secret key
    --mail-host <mailHost>          mail host to send email
    --mail-subject <mailSubject>    the subject of the email
    -r, --receiver <receiver>       address of the receiver of the email
    -s, --sender <sender>           address of the sender of the email (from)
    --region <region>               AWS SES region (default us-east-1)
    --ses                           Use AWS SES to send the email
```

The all-important dashboard ID can be gleaned from the URL for the dashboard:

![Teaser](images/dashboard-id-v2.png)

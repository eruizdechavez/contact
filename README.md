# Contact

A basic node server for sending email forms.

**Contact** is a super basic Node.js application that enables you to send email forms with minimal configuration. All form configuration is done in your HTML.

```html
<form method="post" action="http://example.com/contact@example.com">
  <input type="hidden" name="_subject" value="This is a test form" />
  <input type="email" name="_from" />
  <input type="text" name="first_name" />
  <input type="text" name="last_name" />
  <textarea name="comments"></textarea>
  <input type="submit" name="Submit" />
</form>
```

This project is, in some way, a clone of a great free service: [Formspree.io](https://formspree.io/). Although Formspree is great, it might **not** be the best option for everyone; 2 key factors drived me to create this clone:

  1. Setup (and maintenance) should be minimal.
    Formspree is opensource and it's code is on GitHub, but the setup process is way more than a trivial task, not to mention the requirements. Requirement 1 not met.

  1. Should allow me to send attachments.
    Formspree does not allow you to send email forms with attachments (at least not at the time when this written). Requirement 2 not met.

## Requirements

- Node.js v6.0.0 or greater.
- A Mailgun account.

## Installation 

Clone this repo on your server or download the zip file.

Once you have the code, run `npn install --production` to download and install all the project dependencies required to run this project.

Next step, configure your server. Open `config/config.yml` which should look like this:

```yml
emails:
mailgun:
  url:
  key:
```

And update the values to match your preferences:

- **emails** is an array of email addresses. This emails are the **ONLY** emails this server will be allowed to send emails to (authorized emails)
- **mailgun.url** your Mailgun API URL
- **mailgun.key** you Mailgun Domain API Key

An example of a `config.yml` file:

```yml
emails:
  - sales@example.com
  - contact@example.com
  - support@example.com
mailgun:
  url: https://api.mailgun.net/v3/example.com/messages
  key: key-l0r3m1p5umd0l0r5174m37c0n53c737u  
```

**Contact** uses [indecent.js][indecent] for loading its YAML configuration files, this allows you to override the above settings based on the value of `NODE_ENV`. You can read more about that in the [module documentation][indecent].

[indecent]: https://github.com/eruizdechavez/indecent.js

## Server Usage

To run the server, just run `node index.js`. You can use other node runners to keep the server always running like `forever` or `nodemon`.

## Sending Emails

Once your server is up and running, all you need to do is create an HTML form and point it to your server.

Your form's action should point to your **contact** server using a valid email address (defined in the YAML file). If the email address is not in the whitelist the email will not be sent.

### Fields

- **_from**: *Required*. This is usually the email address of the user submitting the email form. It will be used as the Form field. 
- **_subject**: *Optional*. The email subject.
- **_info**: *Optional*. This text will be included in the email body before the values. Useful for providing some context in the email body.
- **_attachment**: *Optional*. A file can be attached to the email form using this for the name of an `<input type="file"/>`. When sending attachments do not forget to include `enctype="multipart/form-data"` in your form tag.
- **_next**: *Optional*. A URL to redirect the user once the form was submited succesfully.
- **_fake**: *For testing*. If `true`, the email will not be sent and instead a JSON paylod will be shown. Useful when testing the form with a REST client.

All other form fields will be send by title casing the name. For example `<input type="text" name="first_name" />` will be displayed in the email as "First Name:"

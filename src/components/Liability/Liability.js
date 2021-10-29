import React, { useEffect, useState } from 'react'
import { Button, Image, Spacer, Text } from '@sharingexcess/designsystem'
import { getImageFromStorage, setFirestoreData } from 'helpers'
import { useAuth } from 'hooks'
import firebase from 'firebase/app'
import 'firebase/storage'
import { Link } from 'react-router-dom'

export function Liability() {
  const { user } = useAuth()
  const [file, setFile] = useState()
  const [uploading, setUploading] = useState()
  const [error, setError] = useState()

  useEffect(() => {
    if (file) handleFileUpload()
  }, [file]) // eslint-disable-line

  function handleShare() {
    if (navigator.share) {
      navigator
        .share({
          title: 'Sharing Excess - Driver Liability Release Form',
          text: 'Download, sign, and date this form to start driving with SE!',
          url: `${window.location.origin}/driver_liability_release.pdf`,
        })
        .then(() => console.log('Successful share'))
        .catch(error => console.log('Error sharing:', error))
    } else {
      window.open(
        `mailto:${encodeURI(
          `subject=Sharing Excess Driver Liability Release Form&body=Download the form here: ${window.location.origin}/driver_liability_release.pdf  and upload your signed document at ${window.location.origin}`
        )}`,
        '_blank'
      )
    }
  }

  function downloadForm() {
    window.open(
      `${window.location.origin}/driver_liability_release.pdf`,
      '_blank'
    )
  }

  function handleFileChange(e) {
    setFile(e.target.files[0])
  }

  async function handleFileUpload() {
    if (file) {
      try {
        setUploading(true)
        const ref = firebase.storage().ref()
        const path = `/Users/${user.id}/forms/driver_liability_release.pdf`
        await ref.child(path).put(file, { contentType: file.type })
        const full_url = await getImageFromStorage(path)
        await setFirestoreData(['Users', user.id], {
          driver_liability_release: full_url,
        })
        setUploading(false)
      } catch (e) {
        setError(true)
      }
    }
  }

  function downloadExistingForm() {
    window.open(user.driver_liability_release, '_blank')
  }

  return (
    <main id="Liability">
      <Text type="section-header" color="white" shadow>
        Driver Liability Release
      </Text>
      <Spacer height={8} />
      <Text type="subheader" color="white" shadow>
        {user.driver_liability_release
          ? 'You already uploaded your liability release form, and can view it below!'
          : "Download the PDF below, sign and date, and upload using the button below! If you can't upload from your phone, feel free to use the 'Send me a Blank Form' button to open this on your computer."}
      </Text>
      <Spacer height={8} />
      <div id="Liability-buttons">
        {user.driver_liability_release ? (
          <Button
            color="white"
            size="small"
            type="primary"
            handler={downloadExistingForm}
          >
            Download My Form
          </Button>
        ) : null}
        <Button
          color="white"
          size="small"
          type="primary"
          handler={downloadForm}
        >
          Download Blank Form
        </Button>
        <Button color="white" size="small" type="primary" handler={handleShare}>
          Send Me a Blank Form
        </Button>
        <Button
          color="white"
          size="small"
          type="primary"
          disabled={uploading || error}
        >
          <label htmlFor="Liability-file-upload">
            {uploading
              ? 'Uploading form...'
              : error
              ? 'Error uploading form!'
              : `Upload ${
                  user.driver_liability_release ? 'New Signed' : 'Signed'
                } Form`}
          </label>
        </Button>
        <input
          type="file"
          id="Liability-file-upload"
          onChange={handleFileChange}
          accept="application/pdf"
        />
      </div>
      <Spacer height={32} />
      {user && user.driver_liability_release ? (
        <embed id="Liability-pdf" src={user.driver_liability_release} />
      ) : (
        <Image id="Liability-pdf" src="/driver_liability_release.png" />
      )}
      <Spacer height={32} />
      {user && user.driver_liability_release ? (
        <Link to="/">
          <Button size="small">Back to Home</Button>
        </Link>
      ) : null}
    </main>
  )
}

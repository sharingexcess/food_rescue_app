import { Button, Spacer, Text } from '@sharingexcess/designsystem'
import { setFirestoreData } from 'helpers'
import { useAuth } from 'hooks'
import 'firebase/storage'
import { Link, useHistory } from 'react-router-dom'
import { Input } from 'components'

export function Liability() {
  const history = useHistory()
  const { user } = useAuth()

  function agreeToLiability(e) {
    setFirestoreData(['users', user.id], {
      onboarding: { completed_liability_release: true },
    })
    history.push('/')
  }

  return (
    <main id="Liability">
      <Text type="section-header" color="white" shadow>
        Sharing Excess - Driver Liability Release Form
      </Text>
      <Spacer height={8} />
      <Text type="paragraph" color="white" shadow>
        I certify that I am at least 18 years of age and acknowledge that I am
        not an employee of Sharing Excess, a Non-Profit Organization, having an
        office at 3230 Market Street, Philadelphia, PA 19104 (referred to in
        this release as “Sharing Excess”). I acknowledge that I will be
        conducting Food Rescue pickups for Sharing Excess. I acknowledge that I
        will receive compensation (outlined in a separate agreement) from
        Sharing Excess for services I provide. I acknowledge that this work will
        involve hard work, including bending, stooping, reaching, kneeling,
        lifting and carrying, and I certify and agree that I am in good health
        and physically able to perform such work. I acknowledge that this work
        may involve risk of injury from such work and I agree that I am not an
        employee of Sharing Excess and that I am providing services for Sharing
        Excess at my own risk. As such, I will not be entitled to workers'
        compensation benefits in the event of any injury.
      </Text>
      <Spacer height={20} />
      <Text type="paragraph" color="white" shadow>
        I agree that, while providing services to Sharing Excess, and while
        transporting, or being transported to and from the Food Rescue site if
        transportation is provided by Sharing Excess or any of its employees,
        agents or other volunteers, I will:
      </Text>
      <Spacer height={20} />
      <ul>
        <li display="list-item">
          <Text type="paragraph" color="white" shadow>
            Observe all safety requirements of Sharing Excess or the property
            owner where the services are conducted, and;
          </Text>
        </li>
        <li>
          <Text type="paragraph" color="white" shadow>
            Observe all safety requirements of Sharing Excess or the property
            owner where the services are conducted, and;
          </Text>
        </li>
      </ul>
      <Spacer height={20} />
      <Text type="paragraph" color="white" shadow>
        I agree that, while using my own vehicle while providing services to
        Sharing Excess, I will:
      </Text>
      <Spacer height={20} />
      <ul>
        <li>
          <Text type="paragraph" color="white" shadow>
            Maintain a valid driver's license and active auto insurance
          </Text>
        </li>
        <li>
          <Text type="paragraph" color="white" shadow>
            Inspect and maintain my automobile, obey all traffic laws, drive
            safely and maintain state required minimum automobile liability
            insurance coverage, which will be primary in the event I am involved
            in an automobile accident
          </Text>
        </li>
        <li>
          <Text type="paragraph" color="white" shadow>
            Report to Sharing Excess officials any accidents, speeding tickets
            or other traffic violations charged during my services for Sharing
            Excess within 48 hours
          </Text>
        </li>
        <li>
          <Text type="paragraph" color="white" shadow>
            Pay any and all traffic violations, including parking tickets, that
            I may receive during my services for Sharing Excess
          </Text>
        </li>
      </ul>

      <Spacer height={20} />
      <Text type="paragraph" color="white" shadow>
        I acknowledge that Sharing Excess retains the right at its discretion to
        discontinue my services if I am deemed an unsafe driver or act in any
        way that is not in line with the mission and goals of the organization.
      </Text>

      <Spacer height={20} />
      <Text type="paragraph" color="white" shadow>
        I acknowledge that Sharing Excess retains the right at its discretion to
        discontinue my services if I am deemed an unsafe driver or act in any
        way that is not in line with the mission and goals of the organization.
        I acknowledge that Sharing Excess is allowing me to participate in these
        services in reliance upon statements made in this Release and upon the
        release of possible claims against them that I am providing in this
        Release. Accordingly, I do hereby, for myself, and dependents, heirs,
        executors and administrators, release, acquit, and forever discharge
        Sharing Excess, affiliated companies/programs, representatives, members,
        designees, officers, directors, board members, employees, agents,
        successors and their assigns (and the property owners where the services
        are conducted and their respective companies, directors, officers,
        employees, agents, representatives, successors and their assigns), of
        and from all, and all manner of, actions, causes of action, suits,
        controversies, damages, judgements, liabilities, claims and demands of
        any nature whatsoever whether in law or in equity, resulting from my
        services to Sharing Excess.
      </Text>
      <Spacer height={20} />
      <Text type="paragraph" color="white" shadow>
        I understand that this release is intended to prevent any and all future
        legal action or claims which I might have against Sharing Excess and/or
        property owners arising out of my services provided, including but not
        limited to, travel in my automobile and any other, to and from the
        service site.
      </Text>
      <Spacer height={20} />
      <Text type="paragraph" color="white" shadow>
        I grant full permission to Sharing Excess to use any photographs, film,
        video or audio tapes of me performing services for any purpose Sharing
        Excess deems appropriate.
      </Text>
      <Spacer height={20} />
      <Input
        label="Agree to Liability release form"
        type="checkbox"
        value={user.onboarding.completed_liability_release}
        onChange={agreeToLiability}
      />

      {user && user.onboarding.completed_liability_release ? (
        <Link to="/">
          <Button size="small">Back to Home</Button>
        </Link>
      ) : null}
    </main>
  )
}

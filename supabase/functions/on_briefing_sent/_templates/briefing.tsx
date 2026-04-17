import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface BriefingEmailProps {
  clientName: string
  briefingTitle: string
  briefingContent: string
  briefingId: string
  dashboardUrl: string
}

// Brand palette (mirrors tailwind config)
const navy = '#1a2744'
const burgundy = '#8b1c3f'
const cream = '#f5f3ef'
const ink = '#1f2937'
const mute = '#4b5563'

export const BriefingEmail = ({
  clientName,
  briefingTitle,
  briefingContent,
  briefingId,
  dashboardUrl,
}: BriefingEmailProps) => {
  const briefingUrl = `${dashboardUrl.replace(/\/$/, '')}/dashboard/briefings/${briefingId}`
  const preview = briefingTitle.slice(0, 120)

  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={{ backgroundColor: cream, margin: 0, padding: 0, fontFamily: 'Inter, Arial, sans-serif', color: ink }}>
        <Container style={{ maxWidth: '600px', margin: '0 auto', padding: '0 0 32px 0' }}>
          {/* Header */}
          <Section style={{ backgroundColor: navy, padding: '28px 32px' }}>
            <Text style={{ color: '#ffffff', fontSize: '18px', fontWeight: 600, margin: 0, letterSpacing: '0.02em' }}>
              MNL Advocates LLP
            </Text>
            <Text style={{ color: '#cbd5e1', fontSize: '13px', margin: '4px 0 0 0', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              RegWatch Regulatory Briefing
            </Text>
          </Section>

          {/* Body */}
          <Section style={{ backgroundColor: '#ffffff', padding: '40px 32px' }}>
            <Text style={{ fontSize: '15px', color: mute, margin: '0 0 24px 0' }}>
              Dear {clientName || 'Client'},
            </Text>

            <Heading
              as="h1"
              style={{
                fontFamily: 'Playfair Display, Georgia, serif',
                fontSize: '26px',
                lineHeight: '1.3',
                color: burgundy,
                margin: '0 0 20px 0',
              }}
            >
              {briefingTitle}
            </Heading>

            <Text style={{ fontSize: '15px', lineHeight: '1.7', color: ink, whiteSpace: 'pre-wrap', margin: '0 0 32px 0' }}>
              {briefingContent}
            </Text>

            <Section style={{ textAlign: 'center', margin: '32px 0 16px 0' }}>
              <Button
                href={briefingUrl}
                style={{
                  backgroundColor: burgundy,
                  color: '#ffffff',
                  padding: '14px 28px',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                }}
              >
                View on RegWatch Dashboard
              </Button>
            </Section>
          </Section>

          {/* Footer */}
          <Section style={{ padding: '24px 32px' }}>
            <Hr style={{ borderColor: '#e5e7eb', margin: '0 0 16px 0' }} />
            <Text style={{ fontSize: '12px', color: mute, lineHeight: '1.6', margin: 0 }}>
              This briefing was prepared and approved by MNL Advocates LLP. For queries, reply to this email
              or contact your assigned lawyer.
            </Text>
            <Text style={{ fontSize: '11px', color: '#9ca3af', margin: '12px 0 0 0' }}>
              MNL Advocates LLP · Nairobi, Kenya
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export default BriefingEmail

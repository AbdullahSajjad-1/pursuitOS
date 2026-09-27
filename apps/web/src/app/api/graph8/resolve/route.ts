import { NextResponse } from 'next/server';
import * as reader from '@pursuitos/server/graph8/reader';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({ error: 'Domain query parameter is required' }, { status: 400 });
    }

    const cleanDomain = domain.trim().toLowerCase();
    const company = await reader.getCompanyByDomain(cleanDomain);

    if (!company) {
      return NextResponse.json({
        found: false,
        domain: cleanDomain,
        message: 'Company not found in Graph8 CRM'
      });
    }

    // Parallel fetch real contacts, deals, notes, and live company enrichment
    const [contacts, deals, notes, companyEnrich] = await Promise.all([
      reader.getCompanyContacts(company.id),
      reader.getDeals(company.id),
      reader.getNotes('company', company.id),
      reader.enrichCompany(cleanDomain).catch(() => null)
    ]);

    // Live enrich primary contact if available
    let primaryEnrich: any = null;
    if (contacts.length > 0) {
      primaryEnrich = await reader.enrichPerson({
        email: contacts[0].email,
        first_name: contacts[0].firstName,
        last_name: contacts[0].lastName,
        company_domain: cleanDomain
      }).catch(() => null);
    }

    return NextResponse.json({
      found: true,
      company: {
        id: company.id,
        name: company.name,
        domain: company.domain,
        linkedinUrl: companyEnrich?.found ? companyEnrich.data?.linkedin_url : null,
        description: companyEnrich?.found ? companyEnrich.data?.description : null,
        revenue: companyEnrich?.found ? companyEnrich.data?.revenue : null,
        employeeCount: companyEnrich?.found ? companyEnrich.data?.employee_count : null,
      },
      contactsCount: contacts.length,
      dealsCount: deals.length,
      notesCount: notes.length,
      contacts: contacts.map((c, i) => {
        const isPrimary = i === 0;
        const pe = isPrimary && primaryEnrich?.found ? primaryEnrich.data : null;
        return {
          id: c.id,
          name: `${c.firstName} ${c.lastName}`.trim(),
          title: c.title,
          email: pe?.work_email || c.email,
          phone: pe?.mobile_phone || pe?.direct_phone || c.phone,
          linkedinUrl: pe?.linkedin_url || null,
          headline: pe?.linkedin_headline || null
        };
      }),
      deals: deals.map(d => ({
        id: d.id,
        name: d.name,
        stage: d.stage
      }))
    });
  } catch (error: any) {
    console.error('Error resolving company in Graph8:', error);
    return NextResponse.json({ error: error.message || 'Failed to resolve company' }, { status: 500 });
  }
}

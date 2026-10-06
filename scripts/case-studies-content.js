/* ============================================================
   Case study content: the single source for every page under /case-studies/.

   scripts/build-case-studies.js turns this into the pages, the build list on
   /case-studies and /assets/data/portfolio-builds.json. Edit the words here,
   then run the build. Do not hand-edit the generated pages.

   Rewritten from the write-ups on the old portfolio site. Rules kept here:
   - nothing added that the original write-up did not say: no new results,
     figures, clients or quotes
   - no caller, customer, employee or candidate names; no client business names
   - images live in /assets/img/work/<slug>/NN.webp and NN.jpg, cleaned of
     personal data before they were committed. imgs[n] describes file NN.
   - noindex: true for thin builds (fewer than 2 usable images). They get a
     page but stay out of the sitemap, the /case-studies list and the galleries.

   Block types in `how`: { p }, { h3 }, { ol: [] }, { ul: [] }, { img: n }.
   ============================================================ */

const PILLAR = { href: '/blog/ai-automation-for-small-business-questions', text: 'AI automation for small business: 24 questions answered' };

module.exports = [
  {
    slug: 'ai-voice-receptionist-for-plumbing-businesses',
    category: 'Voice Agents',
    title: 'An AI receptionist that answers every call for a plumbing business',
    cardTitle: 'AI voice receptionist for a plumbing business',
    summary: 'It picks up on the first ring, day or night, works out the job and how urgent it is, logs the lead, adds it to the CRM and texts the plumber the details.',
    description: 'How we built an AI receptionist for a plumbing business: it answers every call, flags emergencies, logs the lead in a sheet and HubSpot, and sends a WhatsApp alert.',
    problem: [
      'Plumbers earn money under a sink, not next to a phone. So the phone goes unanswered. A missed call is usually a missed job, and a single job can be worth a few hundred dollars, more for an emergency at 11pm.',
      'After hours, calls go to voicemail and most people do not leave one. They call the next plumber on the list. The work is there. Nobody is free to answer it.'
    ],
    how: [
      { p: 'We built a voice agent that answers like a receptionist. It picks up on the first ring, asks the caller for their name, address and what is wrong, works out how urgent it is, and hands the plumber a clean lead before the caller hangs up.' },
      { img: 1 },
      { h3: '1. It answers and talks' },
      { p: 'The agent holds a real conversation in a natural voice. There is no phone menu. The caller explains the problem the way they would to a person.' },
      { h3: '2. It qualifies the job' },
      { p: 'It asks who is calling, where, what is broken and how bad it is. In one real call, a caller reported no hot water since the night before and a suspected water heater failure. The agent took down the name, number, address, problem and preferred time window on its own.' },
      { h3: '3. It structures the data' },
      { p: 'Everything the caller says becomes clean fields: caller name, phone number, address, problem, urgency and preferred time. There is no free text to sort through later.' },
      { img: 2 },
      { h3: '4. It logs every lead' },
      { p: 'Each call becomes a row in a spreadsheet with the full summary attached, so nothing gets lost between the call and the callback.' },
      { img: 3 },
      { h3: '5. It creates a CRM contact' },
      { p: 'The lead goes straight into HubSpot as a new contact with the phone number, address and a note about the job. The contact list builds itself.' },
      { img: 4 },
      { h3: '6. It separates emergencies from routine work' },
      { p: 'A burst pipe at midnight and a quote for next week are not the same job. Urgent calls go to an instant alert so they never sit in a queue. Routine ones are handled without the same urgency.' },
      { img: 5 },
      { h3: '7. It alerts the plumber' },
      { p: 'A WhatsApp message arrives with the name, number, address and problem, so the plumber calls back already knowing what they are walking into.' },
      { img: 6 }
    ],
    human: [
      'The callback. The plumber phones the customer back, already knowing the name, address and problem.',
      'Emergencies. The system flags them the moment they come in. The plumber decides how to respond.',
      'The job itself, and anything the caller needs that the questions did not cover.'
    ],
    tools: ['Retell', 'ElevenLabs', 'n8n', 'Google Sheets', 'HubSpot', 'Twilio', 'WhatsApp'],
    builtWith: 'Retell for the voice agent, ElevenLabs for the voice, n8n for the automation backend, Google Sheets for the lead log, HubSpot for the CRM and Twilio for the WhatsApp alerts. Each part can be swapped. The same system works for an HVAC company, an electrician or any business that depends on the phone.',
    service: { href: '/industries/plumbers', text: 'AI receptionist for plumbers' },
    posts: [
      { href: '/blog/ai-phone-answering-small-business', text: 'AI receptionist for trades and small clinics: when it pays, and when to keep the human' },
      { href: '/blog/missed-call-text-back', text: 'Missed call text back: when a text is enough' }
    ],
    imgs: {
      1: { alt: 'n8n workflow for the plumbing receptionist: Retell call webhook, extract call data, save lead to sheet, add to CRM, then an emergency check that sends an emergency or routine WhatsApp alert', caption: 'The backend in n8n. Every finished call runs this chain, and the last step splits emergencies from routine jobs.' },
      2: { alt: 'Retell call record showing the call analysis and the extracted fields for caller name, preferred time, phone number, address, problem and urgency, with personal details blurred', caption: 'One call after analysis. The agent filled every field itself. We blurred the caller\'s details.' },
      3: { alt: 'Google Sheet named Plumbing Leads with caller name and summary columns, one row per call, with the contents blurred', caption: 'The running lead log, one row per call. Names and summaries are blurred.' },
      4: { alt: 'HubSpot contacts list showing contacts created by the receptionist, with names, emails and phone numbers blurred', caption: 'Contacts the agent created in HubSpot. Personal details are blurred.' },
      5: { alt: 'Close-up of the n8n branch: an Is Emergency check with a true path to Emergency WhatsApp and a false path to Routine WhatsApp', caption: 'The emergency check. True goes to the urgent alert, false to the routine one.' },
      6: { alt: 'WhatsApp chat with the Twilio sender showing a message delivered on the alert channel', caption: 'The WhatsApp channel the alerts go out on, here with a Twilio test message.' }
    }
  },

  {
    slug: 'whatsapp-ai-support-agent-rag-human-handoff',
    category: 'Chat & Support',
    title: 'A WhatsApp support agent that answers from your own policies and hands hard cases to a person',
    cardTitle: 'WhatsApp support agent with a human handoff',
    summary: 'It answers customers from the business\'s knowledge base, scores its own confidence, and passes refunds, complaints and anything it does not know to a person on Slack with the full context.',
    description: 'How we built a WhatsApp support agent that answers from the store\'s own policies, rates its confidence, and hands refunds and complaints to a person on Slack.',
    problem: [
      'Small businesses get the same WhatsApp questions all day: shipping times, return policy, delivery costs. Answering them by hand takes hours, and messages that arrive after closing wait until morning.',
      'The usual fix is a basic chatbot. It either shows canned menu buttons or makes things up. Both lose customers. A wrong answer about a refund is worse than no answer.'
    ],
    how: [
      { p: 'The agent has two parts. The first loads the store\'s policies into a knowledge base. The second handles each incoming message.' },
      { img: 1 },
      { h3: 'Loading the knowledge base' },
      { p: 'One manual step loads the shipping and returns rules, turns them into embeddings so they can be searched by meaning, and stores them. When a policy changes, we run it again. No code changes.' },
      { h3: 'Handling a message' },
      { p: 'A customer texts the WhatsApp number. The agent searches the knowledge base for the right policy and writes a reply. With the reply it returns a confidence level and a yes or no on whether a person is needed.' },
      { p: 'If it is confident and the question is routine, it replies at once and logs the conversation. If not, it posts an alert to Slack with the customer\'s number, the confidence level and a draft reply, and tells the customer a person will follow up.' },
      { img: 2 },
      { h3: 'A routine question' },
      { p: 'A customer asked how much express shipping costs. The agent searched the knowledge base and replied that express shipping costs $15 and arrives in 1 to 2 business days, and that orders over $50 ship free. Confidence was high and no person was needed. The numbers came from the store\'s policy, not from the model.' },
      { img: 3 },
      { h3: 'A refund request' },
      { p: 'A customer wrote that their order arrived broken and they wanted a refund. The agent treated it as a dispute it should not handle on its own. Confidence was low and it flagged the message for a person. It posted the alert to Slack and told the customer someone would get back to them shortly.' },
      { img: 4 },
      { img: 5 },
      { p: 'Every exchange is written to a Google Sheet.' },
      { img: 6 }
    ],
    human: [
      'Refunds, complaints and disputes. The agent drafts a reply, a person decides.',
      'Anything the knowledge base does not cover. The agent says so instead of guessing.',
      'Keeping the policies current. When a rule changes, someone updates the documents and reloads them.'
    ],
    tools: ['n8n', 'OpenAI', 'RAG', 'Twilio', 'WhatsApp', 'Slack', 'Google Sheets'],
    builtWith: 'n8n for the automation, OpenAI GPT-4o-mini for the agent, a vector store for the knowledge base, Twilio for WhatsApp, Slack for the handoff and Google Sheets for the log. This build keeps the knowledge base in memory. For a live deployment we would move it to a persistent vector database such as Pinecone or Supabase, so it survives restarts and can hold a full catalog. The rest stays the same.',
    service: { href: '/services/rag-knowledge-base', text: 'Knowledge base and RAG agents' },
    posts: [{ href: '/blog/whatsapp-sms-customer-support', text: 'WhatsApp and SMS customer support with AI' }],
    imgs: {
      1: { alt: 'n8n workflow with two lanes: a knowledge base loader that embeds store documents, and the live path from WhatsApp message to support agent, response parser, needs-human check, Slack escalation, log and WhatsApp reply', caption: 'The whole workflow. The top lane loads the knowledge base. The bottom lane runs on every message.' },
      2: { alt: 'The same n8n workflow after a run, with the knowledge base loader steps marked complete', caption: 'After a run. The loader has filled the knowledge base the agent searches.' },
      3: { alt: 'WhatsApp conversation where the customer asks about express shipping and the agent replies with the price, delivery time and free shipping threshold, with the sandbox code, phone number and a name blurred', caption: 'A routine question answered from policy. The sandbox code, number and name are blurred.' },
      4: { alt: 'WhatsApp conversation showing the shipping answer, then a refund request and the agent\'s reply that a team member will follow up', caption: 'The refund request. The agent does not try to settle it.' },
      5: { alt: 'Slack channel support-escalations with a Human needed alert showing the customer, a low confidence level and a draft reply, with the customer number and staff name blurred', caption: 'The handoff in Slack, with a draft reply for the team to review.' },
      6: { alt: 'Google Sheet named WhatsApp Logs with columns for reply, confidence, needs human and customer, with customer numbers blurred', caption: 'The conversation log. Customer numbers are blurred.' }
    }
  },

  {
    slug: 'ecommerce-support-agent',
    category: 'Chat & Support',
    title: 'An AI support agent for an online store that looks up real orders and escalates the hard cases',
    cardTitle: 'Ecommerce support agent: orders, returns and escalation',
    summary: 'It reads each customer message, works out what they need, answers from live order data, starts returns, and sends complaints and billing disputes to a person.',
    description: 'How we built an AI support agent for an online store: it reads each message, looks up the real order, handles returns, and escalates complaints to a person in Slack.',
    problem: [
      'Store support is a mix of very different messages in one inbox. Where is my order. I want a refund. Is this backpack waterproof. An angry customer threatening a chargeback. Each needs a different answer, and most need someone to look something up first.',
      'A person has to read each one, work out the intent, find the order, write a reply and decide whether to escalate. Customers wait hours for answers that could have been instant, and the urgent cases wait in the same queue as a tracking question.'
    ],
    how: [
      { p: 'An AI step reads each message and sorts it into one of four intents. The agent then takes a different action for each.' },
      { ul: [
        'Order status. It looks up the customer\'s real order and replies with the order number, status, total and tracking.',
        'Product question. A separate AI step answers the customer\'s specific question.',
        'Return. It confirms the request, tells the customer the instructions are on the way and alerts the returns team.',
        'Anything else. Complaints, billing disputes and anything emotional go straight to a person with a full alert.'
      ] },
      { p: 'Every interaction is also posted to the right team channel in Slack.' },
      { img: 1 },
      { img: 2 },
      { h3: 'Where is my order' },
      { p: 'A customer asked about their order. The agent looked up the record and replied with the order number, status and total, pulled live from the order database.' },
      { img: 3 },
      { img: 4 },
      { img: 5 },
      { h3: 'A return request' },
      { p: 'A customer wanted to return a jacket that did not fit. The agent recognized a return, confirmed it to the customer and alerted the returns team.' },
      { img: 6 },
      { img: 7 },
      { h3: 'An angry customer' },
      { p: 'A customer had been charged twice and wanted a manager. The agent did not try to handle it with a script. It escalated to a person straight away and acknowledged the customer.' },
      { img: 8 }
    ],
    human: [
      'Complaints, billing disputes and anything emotional.',
      'The return itself. The agent confirms the request, the returns team handles it.',
      'Anything that falls outside the four intents.'
    ],
    tools: ['n8n', 'OpenAI', 'Airtable', 'Slack'],
    builtWith: 'n8n, OpenAI for intent classification and product answers, Airtable as the order database, and Slack for routing and escalations. The order database can be swapped for Shopify, WooCommerce or a custom backend without changing the agent\'s logic.',
    service: { href: '/services/industries/ecommerce', text: 'Ecommerce automation for multi-channel stores' },
    posts: [
      { href: '/blog/where-is-my-order-automation', text: 'Where is my order, answered before they ask' },
      { href: '/blog/returns-automation', text: 'Returns automation' }
    ],
    imgs: {
      1: { alt: 'n8n workflow: webhook trigger, analyze customer message, parse AI response, route by intent to order search, return, product question or escalation paths, each posting to Slack, then send response', caption: 'The workflow. One message comes in and the intent router picks the path.' },
      2: { alt: 'The same workflow after a return request, with the return path highlighted', caption: 'A return request taking its path through the router.' },
      3: { alt: 'Slack message titled Order lookup showing order ORD-1006 with status Processing and total $35.20, with the customer\'s name and email blurred', caption: 'The order lookup posted to the team. Customer details are blurred.' },
      4: { alt: 'n8n message editor showing the Slack message template built from the order search fields', caption: 'The message template. Each field comes from the order search.' },
      5: { alt: 'Airtable order management dashboard listing orders with status, order number, tracking number and total, with customer names and emails blurred', caption: 'The order table the agent reads from. Names and emails are blurred.' },
      6: { alt: 'n8n output of the intent router showing the reply, intent return, and the customer\'s message about returning a jacket, with name and email blurred', caption: 'The router\'s output for the return. The intent is return.' },
      7: { alt: 'Slack message titled Return request with the customer\'s message about returning a jacket, with the customer\'s name and email blurred', caption: 'The alert to the returns team.' },
      8: { alt: 'Slack message titled Escalation needed with the customer\'s message about a double charge and intent other, with the email blurred', caption: 'The escalation. A person takes it from here.' }
    }
  },

  {
    slug: 'real-estate-inquiry-triage',
    category: 'Lead & Sales',
    title: 'Inquiry triage for a real estate agency that replies at once and routes each lead',
    cardTitle: 'Real estate inquiry triage and routing',
    summary: 'It reads every inquiry, sorts it into buying, selling, renting or general, sends a personal reply, and posts serious leads to the right team\'s channel.',
    description: 'How we built inquiry triage for a real estate agency: each inquiry gets a personal reply, a category, and a post in the right team\'s Slack channel.',
    problem: [
      'Inquiries arrive through forms and email all day, and they all look the same until someone reads them. A cash buyer with a $1.2M budget lands next to someone who is just browsing. A seller who needs a fast valuation looks like a general question.',
      'Sorting them by hand is slow and inconsistent. The best leads wait while the agent works through everything else, and in real estate the first agent to respond often wins the deal.'
    ],
    how: [
      { p: 'When an inquiry arrives, the system writes a personal reply that refers to what the person asked for. An AI step classifies the inquiry as buying, selling, renting or general.' },
      { p: 'A router then sends each lead down its own path. Buyers go to the buying channel, sellers to selling and renters to renting, each with an instant alert. General inquiries are logged without interrupting anyone. Every inquiry gets its reply and lands in the master sheet.' },
      { img: 1 },
      { img: 2 },
      { img: 3 },
      { img: 4 },
      { h3: 'One buying lead, end to end' },
      { p: 'A family looking for their first home sent an inquiry. The system classified it as buying, posted it to the buying channel and sent a personal reply.' },
      { img: 5 },
      { img: 6 },
      { img: 7 },
      { img: 8 }
    ],
    human: [
      'The conversation with the buyer, seller or renter. The system replies first, an agent follows up.',
      'General inquiries, which are logged for someone to read when they have time.',
      'Viewings, valuations and offers.'
    ],
    tools: ['n8n', 'OpenAI', 'Google Sheets', 'Slack'],
    builtWith: 'n8n, an OpenAI model for the reply and the classification, Google Sheets for the master log, and a Slack channel for each team.',
    service: { href: '/services/industries/real-estate', text: 'AI automation for real estate' },
    posts: [
      { href: '/blog/lead-qualification-routing-ai', text: 'Lead qualification and routing with AI' },
      { href: '/blog/speed-to-lead', text: 'Speed to lead' }
    ],
    imgs: {
      1: { alt: 'n8n workflow: webhook, AI model, code step, append row to sheet, then a switch that routes selling, renting, buying and general inquiries to separate Slack messages before responding', caption: 'The triage workflow. The switch sends each category to its own channel.' },
      2: { alt: 'Slack buying_leads channel with a new buying lead from an investor looking for rental properties, with the lead\'s name and the posting account blurred', caption: 'A buying lead in the buying channel. Names are blurred.' },
      3: { alt: 'Slack renting_leads channel with a new renting lead looking for a furnished apartment, with the lead\'s name and account details blurred', caption: 'A renting lead in the renting channel.' },
      4: { alt: 'Slack selling_leads channel with a new selling lead asking for a valuation, with the lead\'s name and street address blurred', caption: 'A selling lead. The address is blurred.' },
      5: { alt: 'The triage workflow after the run, with the buying path highlighted', caption: 'The buying path after the run.' },
      6: { alt: 'Slack buying_leads channel with the new lead from a family looking for their first home, with names blurred', caption: 'The lead in the buying channel.' },
      7: { alt: 'JSON response with the personal reply thanking the family for reaching out, with the first name blurred', caption: 'The reply the family received, signed by the agency team.' },
      8: { alt: 'Google Sheet named Real Estate Leads with name, email, message, category and submitted columns, with names, emails and an address blurred', caption: 'The master sheet with every inquiry and its category. Personal details are blurred.' }
    }
  },

  {
    slug: 'ai-invoice-extraction-pipeline',
    category: 'Documents & Finance',
    title: 'An invoice pipeline that reads emailed PDFs and files the numbers without anyone typing',
    cardTitle: 'AI invoice extraction pipeline',
    summary: 'Email an invoice in and it pulls out the vendor, invoice number, date, amount, tax and currency, files them in a sheet, posts a confirmation to Slack, and flags incomplete invoices for review.',
    description: 'How we built an invoice pipeline that reads emailed PDFs with AI, files vendor, amount, tax and dates in a sheet, and flags incomplete invoices for review.',
    problem: [
      'Every business gets invoices by email, and someone has to open each PDF, read off the vendor, amount, tax and invoice number, type it into a sheet or accounting system, and spot anything odd. It is slow, dull work, and it is where people make mistakes: a swapped digit, a missed invoice, a wrong total.',
      'Across dozens of invoices a month, that is hours spent copying numbers from one place to another.'
    ],
    how: [
      { p: 'The pipeline watches an inbox. When an email with a PDF arrives, it checks the attachment really is a PDF, extracts the text, and asks the AI for six fields: vendor, invoice number, date, amount, tax and currency.' },
      { p: 'It then checks the essentials are present. A complete invoice is filed as a new row and a success message goes to Slack. An incomplete one is flagged for review instead of being filed as bad data.' },
      { img: 1 },
      { h3: 'A real run' },
      { p: 'An invoice arrived from a managed IT services vendor. The pipeline read the PDF and pulled out the vendor, invoice number INV-2048, the date, an amount of $3,041.83, tax of $231.83 and the currency, USD. Nothing was missing, so the invoice was filed and the confirmation posted to Slack. From email to filed took seconds.' },
      { img: 2 },
      { img: 3 },
      { img: 4 }
    ],
    human: [
      'Invoices flagged as incomplete or unreadable. The Slack alert says which one and why.',
      'Approving and paying invoices.',
      'Anything that looks wrong even when every field is present.'
    ],
    tools: ['n8n', 'Gmail', 'OpenAI', 'Google Sheets', 'Slack'],
    builtWith: 'n8n, Gmail as the inbox, GPT-4o-mini to read the fields, Google Sheets for the record and Slack for notifications. The destination can be an accounting system such as QuickBooks or Xero instead of a sheet. The same approach works for purchase orders, receipts and other documents that arrive by email.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/ai-document-data-extraction', text: 'AI document data extraction' }],
    imgs: {
      1: { alt: 'n8n workflow: new invoice email Gmail trigger, has PDF attachment check, extract PDF text, AI extract fields, parse and validate, save to sheet, needs review check, then Slack review alert or Slack success', caption: 'The pipeline in n8n. The review check keeps bad data out of the sheet.' },
      2: { alt: 'The invoice PDF from BrightServe Solutions open in Gmail, showing invoice number INV-2048, the bill to company, dates and line items, with addresses and contact details blurred', caption: 'The incoming invoice. Addresses and contact details are blurred.' },
      3: { alt: 'Slack message Invoice processed with vendor BrightServe Solutions, invoice INV-2048 and amount $3,041.83 USD', caption: 'The confirmation in Slack.' },
      4: { alt: 'Google Sheet named Invoices with vendor, invoice number, date, amount, tax, currency, needs review, review reason and received columns filled for INV-2048', caption: 'The invoice filed as a row, with needs review set to false.' }
    }
  },

  {
    slug: 'voice-agent-rag-post-call-automation',
    category: 'Voice Agents',
    title: 'A phone agent for a home services company that answers from real prices and logs every call',
    cardTitle: 'Voice agent with a knowledge base and post-call automation',
    summary: 'It answers in a natural voice, looks up prices, service areas and hours in a knowledge base during the call, and after the call files the lead in a sheet and CRM and alerts the team.',
    description: 'How we built a phone agent for a home services company: it answers from a real knowledge base during the call, then logs the lead in Sheets and HubSpot and alerts Slack.',
    problem: [
      'Home services companies depend on the phone. A missed call is a missed job, and the answered calls bring a second problem: whoever answers must know every price, area and policy, and write the details down by hand. After hours it does not happen at all.',
      'Many AI receptionists make this worse. A scripted bot cannot answer a pricing question, and a chatbot on a phone line will invent a number to sound helpful. A wrong price is worse than no answer.'
    ],
    how: [
      { p: 'There are two halves: the live call and what happens after it.' },
      { p: 'On the call, the agent answers in a natural voice. When the caller asks something factual, such as the price of an AC repair, whether the company covers a town, or whether it opens on Sunday, the agent searches the knowledge base and answers from it. If the answer is not there, it says a team member will follow up. It quotes starting prices only, does not promise exact arrival times, and passes refund disputes to a person.' },
      { img: 1 },
      { img: 2 },
      { p: 'After the call, the details go to n8n. It pulls out the caller\'s name, phone, address, the service needed and the urgency. It saves a row to a sheet, creates a HubSpot contact with a full summary, and posts to Slack. Emergencies get a dispatch alert. Routine calls get a booking notice.' },
      { img: 3 },
      { h3: 'A real run' },
      { p: 'A caller phoned to book an AC repair because the unit was blowing warm air. It was not an emergency. The agent took the name, address, phone number and problem, and confirmed it was a routine job. When the call ended, the details were saved to the sheet, a CRM contact was created with a note about the repair, and a booking notice went to Slack. No one typed anything.' },
      { img: 4 },
      { img: 5 }
    ],
    human: [
      'Dispatching the technician and confirming the visit.',
      'Questions the knowledge base does not cover. The agent promises a follow up instead of guessing.',
      'Refund disputes, which the agent passes straight on.',
      'Final prices. The agent gives starting prices only.'
    ],
    tools: ['Retell', 'RAG', 'n8n', 'HubSpot', 'Google Sheets', 'Slack'],
    builtWith: 'Retell for the voice agent and its knowledge base, n8n for the backend, HubSpot for the CRM, Google Sheets for the call log and Slack for dispatch alerts. Change the company information and it works for plumbing, electrical or roofing. The CRM, calendar and alert channel can be swapped for whatever the business already uses.',
    service: { href: '/services/ai-for-trades', text: 'Voice AI agents for trades' },
    posts: [{ href: '/blog/ai-phone-answering-small-business', text: 'AI receptionist for trades and small clinics: when it pays, and when to keep the human' }],
    imgs: {
      1: { alt: 'Retell agent settings for a home services phone assistant, showing the prompt with rules about prices, service areas and booking, and the knowledge base attached', caption: 'The agent\'s instructions in Retell, with the company knowledge base attached.' },
      2: { alt: 'Retell knowledge base page for the company, with the knowledge base ID blurred', caption: 'The knowledge base the agent searches during the call.' },
      3: { alt: 'n8n workflow: Retell call webhook, extract call data, save lead to sheet, add to CRM, is emergency check, then emergency alert or routine alert in Slack', caption: 'The post-call backend in n8n.' },
      4: { alt: 'Slack channel with a New booking message showing service AC repair, blowing warm air, preferred this week and not urgent, with the caller\'s name, phone and address blurred', caption: 'The booking notice in Slack. Caller details are blurred.' },
      5: { alt: 'Google Sheet of call leads with caller name, phone, address, service, urgency, preferred time and summary columns, with personal details blurred', caption: 'The call log in Google Sheets.' }
    }
  },

  {
    slug: 'cancellation-win-back-gohighlevel',
    category: 'Lifecycle & Revenue',
    title: 'A win-back sequence in GoHighLevel that follows up every cancellation and tracks who comes back',
    cardTitle: 'Cancellation win-back in GoHighLevel',
    summary: 'When a subscriber cancels, it asks why, waits, makes the case for returning over the following weeks, then checks whether they resubscribed and files them as reactivated or lost.',
    description: 'How we built a cancellation win-back sequence in GoHighLevel: it asks why, follows up over weeks, then sorts customers into reactivated or lost in the pipeline.',
    problem: [
      'A cancelled subscriber is the cheapest customer to win back. They know the product and they trusted the business once. Winning them back costs a fraction of finding someone new.',
      'Most businesses do nothing. The cancellation goes through and the customer disappears. Nobody asks why they left, so the reason never gets fixed. Nobody follows up, so people who cancelled for a temporary reason never come back, even though many would have.'
    ],
    how: [
      { p: 'The workflow starts when a customer is flagged as cancelled. In this build that is a tag. In a live account it would start from the subscription cancelled event.' },
      { img: 1 },
      { ol: [
        'Move the opportunity to the Cancelled stage, so churn shows in the pipeline.',
        'Send a sorry to see you go email that asks plainly what could have been better. Replies go to a person.',
        'Wait seven days. Nobody wants a pitch the day after they leave.',
        'Send a win-back email with an incentive.',
        'Wait fourteen days.',
        'Send a final win-back email. After this, the system stops contacting them.',
        'Check whether they resubscribed. If yes, tag them as reactivated, move them to Reactivated and send a welcome back message. If not, tag them as lost and move them to Lost.'
      ] },
      { img: 2 },
      { img: 3 },
      { img: 4 },
      { p: 'The final check is what makes this a system rather than a goodbye email. Everyone who cancels ends in one of two labelled buckets, and the recovered customers are visible in the pipeline instead of mixed in with everyone else.' },
      { p: 'The feedback question in the first email matters too. Cancellation is the one moment a customer has both the reason and the motivation to tell you the truth.' },
      { img: 5 },
      { img: 6 }
    ],
    human: [
      'Reading and answering replies to the first email. That is where the reasons for cancelling come from.',
      'Fixing whatever those reasons point to.',
      'Choosing the incentive offered.'
    ],
    tools: ['GoHighLevel'],
    builtWith: 'GoHighLevel workflows, conditional branching, tags, pipeline stages and the email builder. It is one part of a connected lifecycle. It also catches customers whose failed payments could not be recovered and those whose refills lapsed.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [PILLAR],
    imgs: {
      1: { alt: 'GoHighLevel workflow builder zoomed out, showing the subscription cancellation win-back sequence from the cancelled tag trigger to the final paid tag check', caption: 'The whole sequence in GoHighLevel.' },
      2: { alt: 'GoHighLevel win-back incentive email step open in the editor, with the message to a cancelled subscriber', caption: 'The win-back email with the incentive.' },
      3: { alt: 'GoHighLevel final win-back email step open in the editor, offering a free trial to return', caption: 'The final win-back email.' },
      4: { alt: 'The reactivation check: a Check for Paid Tag step branching into Has Paid Tag and None', caption: 'The check at the end. Each person ends up reactivated or lost.' },
      5: { alt: 'GoHighLevel Subscribers pipeline stages: Active, Payment Issue, Refill Due, Cancelled and Reactivated', caption: 'The pipeline stages the lifecycle workflows share.' },
      6: { alt: 'GoHighLevel execution log for the win-back workflow showing each step for one contact, with the contact\'s name blurred', caption: 'The execution log for one test contact. The name is blurred.' }
    }
  },

  {
    slug: 'failed-payment-recovery-gohighlevel',
    category: 'Lifecycle & Revenue',
    title: 'A failed payment recovery sequence in GoHighLevel that stops the moment the customer pays',
    cardTitle: 'Failed payment recovery in GoHighLevel',
    summary: 'When a subscription payment fails, it emails the customer, checks whether they paid, follows up by SMS, checks again, and only then flags the account for a person.',
    description: 'How we built failed payment recovery in GoHighLevel: email, then SMS, with a paid check after each step so nobody is chased after they pay.',
    problem: [
      'A failed payment is rarely a customer leaving. It is an expired card or a changed bank. The customer still wants the product and does not know the charge failed.',
      'Nobody tells them. The subscription lapses and by the time anyone notices, the customer has moved on. Revenue already won is lost to admin nobody was watching.'
    ],
    how: [
      { p: 'The workflow starts when a customer is flagged with a failed payment. In this build that is a tag. In a live account it starts from the payment failed event, with nothing else changing.' },
      { img: 1 },
      { ol: [
        'Send a payment failed email with a link to update the card.',
        'Wait one day.',
        'Check whether they paid. If yes, clear the flag, send a short confirmation and stop.',
        'If not, send an SMS reminder.',
        'Wait two days.',
        'Check again. If they paid, clear the flag and stop.',
        'If not, send a final notice email.',
        'Move the opportunity to the Payment Issue stage.',
        'Alert the team so a person can step in.'
      ] },
      { img: 2 },
      { p: 'The checks are the point. A customer who fixes their card on day one gets one email and nothing more. Chasing someone for money they already paid is how a billing problem becomes a cancellation.' },
      { p: 'Every message is held to business hours. A payment that fails at 3am does not produce a text at 3am.' },
      { img: 3 },
      { img: 4 },
      { img: 5 },
      { img: 6 },
      { img: 7 }
    ],
    human: [
      'Accounts the sequence could not recover. They land in Payment Issue with an alert.',
      'Talking to the customer when a card keeps failing.'
    ],
    tools: ['GoHighLevel'],
    builtWith: 'GoHighLevel workflows, conditional branching, tags, pipeline stages, email and SMS, business hours controls and internal notifications. It is one part of a connected lifecycle. An account that cannot be recovered can feed straight into the win-back sequence.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/automatic-invoice-chasing-payment-recovery', text: 'Automatic invoice chasing and payment recovery' }],
    imgs: {
      1: { alt: 'GoHighLevel workflow builder showing the failed payment recovery sequence from the payment failed trigger through emails, waits and paid checks', caption: 'The recovery sequence in GoHighLevel.' },
      2: { alt: 'Close-up of the paid checks after one day and after the second reminder, each branching to end or continue', caption: 'The checks between messages. A customer who pays is never chased again.' },
      3: { alt: 'GoHighLevel execution log for the recovery workflow showing the steps for one contact, with the contact\'s name blurred', caption: 'One contact moving through the steps. The name is blurred.' },
      4: { alt: 'GoHighLevel enrollment history for the failed payment workflow with three contacts waiting or finished, with contact names blurred', caption: 'Enrollment history. Contacts wait between steps as designed.' },
      5: { alt: 'GoHighLevel execution log listing every step taken for several contacts, with contact names blurred', caption: 'The full execution log.' },
      6: { alt: 'GoHighLevel workflow settings with a time window from 8am to 5pm, Monday to Friday', caption: 'The business hours window.' },
      7: { alt: 'GoHighLevel opportunities list with stages, values and statuses, with opportunity names and contacts blurred', caption: 'Opportunities in the pipeline. Names are blurred.' }
    }
  },

  {
    slug: 'lead-capture-qualification',
    category: 'Lead & Sales',
    title: 'A lead capture system that replies in seconds and flags the hot leads',
    cardTitle: 'AI lead capture and qualification',
    summary: 'Every form submission is logged, answered with a personal reply written by AI, sorted as hot or cold, and hot leads ping the owner in Slack.',
    description: 'How we built AI lead capture for a service business: every form gets a personal reply in seconds, a hot or cold label, and hot leads alert the owner in Slack.',
    problem: [
      'Small service businesses lose money in a quiet way. A lead fills in the contact form, the message sits in a crowded inbox, and someone replies hours later, if at all. By then the prospect has messaged three competitors.',
      'Every lead also looks the same in an inbox. A buyer with budget ready and someone just browsing arrive as the same unread email, so the owner spends the same energy on both and the hot leads get buried.'
    ],
    how: [
      { p: 'A form submission starts the workflow. The lead is saved to a Google Sheet. An AI step writes a personal reply that uses the lead\'s name and refers to their request, and classifies the lead as hot or cold from intent, budget signals and urgency.' },
      { p: 'Hot leads trigger a Slack alert to the owner before the reply goes out. Cold leads are logged and answered without interrupting anyone.' },
      { img: 1 },
      { img: 2 },
      { img: 3 },
      { img: 4 },
      { img: 5 },
      { p: 'The original write-up estimates the time saved: at about 10 minutes of manual handling per lead, a business with 20 leads a day gets back more than 3 hours a day.' }
    ],
    human: [
      'The sales conversation with hot leads.',
      'Cold leads, which are logged for follow up when there is time.',
      'Tuning the reply style and the hot or cold rules.'
    ],
    tools: ['n8n', 'OpenAI', 'Google Sheets', 'Slack'],
    builtWith: 'n8n, an OpenAI model for the reply and the classification, Google Sheets for the log and Slack for alerts.',
    service: { href: '/services/ai-automation', text: 'AI agents and automation' },
    posts: [
      { href: '/blog/speed-to-lead', text: 'Speed to lead' },
      { href: '/blog/lead-qualification-routing-ai', text: 'Lead qualification and routing with AI' }
    ],
    imgs: {
      1: { alt: 'n8n workflow: webhook, append row in sheet, AI model, code step, an If check, Slack message, respond to webhook, after a hot lead run', caption: 'A hot lead running through. The If check sends it to Slack.' },
      2: { alt: 'The same workflow after a cold lead, which skips the Slack alert', caption: 'A cold lead. No alert, just the reply.' },
      3: { alt: 'n8n If node checking whether status equals hot, with the personal reply shown on both sides and the lead\'s first name blurred', caption: 'The hot or cold check, with the drafted reply. The name is blurred.' },
      4: { alt: 'Slack hot_leads channel with three hot lead alerts quoting each lead\'s message, with names and emails blurred', caption: 'Hot lead alerts in Slack. Names and emails are blurred.' },
      5: { alt: 'Google Sheet of leads with name, email, message and submitted time, with names and emails blurred', caption: 'Every lead in the sheet, hot or cold.' }
    }
  },

  {
    slug: 'lead-follow-up-gohighlevel',
    category: 'Lifecycle & Revenue',
    title: 'Lead follow-up in GoHighLevel that runs every step and only messages during business hours',
    cardTitle: 'Lead capture and follow-up in GoHighLevel',
    summary: 'When a lead fills in a form, it adds them to the pipeline, picks text and email or email only, runs a follow-up sequence over several days, and stops if they reply STOP.',
    description: 'How we built lead follow-up in GoHighLevel: pipeline entry, text and email routing, a multi-day sequence held to business hours, and instant opt-out handling.',
    problem: [
      'A lead fills in a form, and for most small businesses the honest answer to what happens next is that someone gets to it eventually. Leads go cold in an inbox. Follow-up depends on a busy person remembering.',
      'Texts go out at 11pm because nobody set rules around timing. A lead who says stop sometimes keeps getting messages, which is the fastest way to a complaint.'
    ],
    how: [
      { p: 'The workflow starts on the form submission. It creates an opportunity at New Lead, then checks whether the lead gave a phone number. Leads with a number get text and email. Leads without get email only.' },
      { img: 1 },
      { img: 2 },
      { p: 'The sequence then runs: an immediate text, a follow-up email, a second text with a booking link, and final email check-ins, spaced out with waits. As it runs, the opportunity moves from New Lead to Nurturing. GoHighLevel honours STOP replies, so a lead who opts out gets nothing more.' },
      { img: 3 },
      { h3: 'A real run' },
      { p: 'A test lead submitted the form outside working hours. The workflow saw a phone number and chose the text and email path. The first text was held with the status Waiting until the next business window, instead of going out in the middle of the night.' },
      { img: 4 }
    ],
    human: [
      'Replies from leads. The sequence starts the conversation, a person continues it.',
      'Booking calls with leads who respond.',
      'Adjusting the cadence, routing rules and stages.'
    ],
    tools: ['GoHighLevel'],
    builtWith: 'GoHighLevel for everything: form capture, the workflow, the pipeline, SMS and email, business hours and opt outs. The calling step can be handed to an AI voice agent that phones the lead, asks qualifying questions and passes qualified leads to a person.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/lead-follow-up', text: 'Automatic lead follow-up' }],
    imgs: {
      1: { alt: 'GoHighLevel workflow builder zoomed out, showing the SMS and email follow-up sequence', caption: 'The whole follow-up sequence.' },
      2: { alt: 'Close-up of the routing condition: the callable path if phone is not empty, otherwise none, followed by create opportunity and the first SMS', caption: 'The routing condition. A phone number means text and email.' },
      3: { alt: 'GoHighLevel workflow settings with a time window from 9am to 6pm, Monday to Friday', caption: 'The business hours window. Messages wait for it.' },
      4: { alt: 'GoHighLevel opportunities list showing two new leads in the Lead Generation pipeline, with contact names blurred', caption: 'The new leads in the pipeline. Names are blurred.' }
    }
  },

  {
    slug: 'post-purchase-lifecycle-gohighlevel',
    category: 'Lifecycle & Revenue',
    title: 'A post-purchase sequence in GoHighLevel that runs a subscriber\'s first ninety days',
    cardTitle: 'Post-purchase subscriber lifecycle in GoHighLevel',
    summary: 'When someone subscribes, it tags them, adds them to the pipeline, welcomes them, shows them how to use the product, sets honest expectations, checks in at 30, 60 and 90 days, then asks for a review.',
    description: 'How we built a post-purchase lifecycle in GoHighLevel: onboarding, an honest expectation email, check-ins at 30, 60 and 90 days, and a review request.',
    problem: [
      'Subscription businesses rarely lose customers because the product is bad. They lose them in the first ninety days. A new subscriber is not sure how to use it, sees no instant result, loses faith and cancels.',
      'The fix is known: onboard properly, be honest about how long results take, and keep showing up. Doing that by hand for every customer stops working after the first dozen.'
    ],
    how: [
      { p: 'The workflow starts when a customer is marked as paid. In this build that is a tag. In a live account it hangs off the Stripe payment trigger, with nothing else changing.' },
      { img: 1 },
      { ol: [
        'Tag the contact active_subscriber.',
        'Create an opportunity in the Subscribers pipeline at Active.',
        'Send a welcome email.',
        'Wait one day, then send an onboarding email on how to use the product.',
        'Wait three days, then send the expectation setting email.',
        'At day 30, send a check-in with a prompt to take a progress photo.',
        'At day 60, the same again.',
        'At day 90, ask for a review and a referral.'
      ] },
      { p: 'The expectation setting email does the most work. It says plainly that results take months, that early ups and downs are normal, and that the people who get the best results are the ones who stay consistent. It goes out before doubt sets in.' },
      { img: 2 },
      { img: 3 },
      { img: 4 },
      { img: 5 }
    ],
    human: [
      'The copy. For regulated businesses such as health or supplements, the brand supplies its own approved text and it drops into the same steps.',
      'Replies to the check-ins.',
      'Reviews and referrals once they come in.'
    ],
    tools: ['GoHighLevel', 'Stripe'],
    builtWith: 'GoHighLevel workflows, tags, pipelines and opportunities, and the email builder. It is one part of a connected lifecycle, alongside failed payment recovery, refill reminders and cancellation win-back, linked through shared tags and pipeline stages.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [PILLAR],
    imgs: {
      1: { alt: 'GoHighLevel workflow builder zoomed out, showing the subscriber lifecycle sequence of emails and waits', caption: 'The ninety day sequence in GoHighLevel.' },
      2: { alt: 'GoHighLevel contact record tagged active_subscriber, with an email in the conversation and the activity timeline, with the contact\'s name and form IDs blurred', caption: 'A test contact with the active_subscriber tag. Personal details are blurred.' },
      3: { alt: 'GoHighLevel execution log for the subscriber lifecycle workflow showing the tag, opportunity, welcome email and wait steps, with the contact name and execution ID blurred', caption: 'The steps firing for one contact.' },
      4: { alt: 'GoHighLevel opportunity edit window showing contact details, pipeline and stage, with the contact\'s name, phone, opportunity name and audit ID blurred', caption: 'An opportunity created by a workflow. Personal details are blurred.' },
      5: { alt: 'GoHighLevel contacts list showing a contact with the active_subscriber tag and active workflows, with name, phone and business name blurred', caption: 'The contact list, with the tag and the workflows each contact is in.' }
    }
  },

  {
    slug: 'refill-reminder-preventing-the-gap-gohighlevel',
    category: 'Lifecycle & Revenue',
    title: 'A refill reminder in GoHighLevel that lands before the customer runs out',
    cardTitle: 'Refill reminder in GoHighLevel',
    summary: 'When a subscriber is due to reorder, it reminds them, checks whether they did, follows up once by SMS, and hands anyone who lapses to the win-back sequence.',
    description: 'How we built a refill reminder in GoHighLevel that fires from the pipeline stage, stops when the customer reorders, and hands lapsed subscribers to win-back.',
    problem: [
      'For a product that only works when used consistently, running out is where the customer is lost. Nothing arrives, progress stalls, and by the time anyone follows up the customer has decided it was not working.',
      'A reminder sent after they run out is too late. It has to land before.'
    ],
    how: [
      { p: 'The trigger is the customer\'s position in the pipeline, not a calendar date. The workflow starts when a subscriber\'s opportunity moves to Refill Due.' },
      { img: 1 },
      { ol: [
        'Send a refill reminder email with a link to reorder.',
        'Wait three days.',
        'Check whether they reordered. If yes, move them back to Active and stop.',
        'If not, send an SMS reminder.',
        'Wait two days.',
        'Check again. If they reordered, back to Active and stop.',
        'If not, tag them refill_lapsed and send a final message. The tag pulls them into the win-back sequence.'
      ] },
      { img: 2 },
      { img: 3 },
      { img: 4 }
    ],
    human: [
      'Customers who reply with questions about their order.',
      'Lapsed subscribers, once the win-back sequence has run.'
    ],
    tools: ['GoHighLevel'],
    builtWith: 'GoHighLevel workflows, pipeline stage triggers, conditional branching, tags, email and SMS. It links to subscriber onboarding, failed payment recovery and cancellation win-back through shared tags and stages.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [PILLAR],
    imgs: {
      1: { alt: 'GoHighLevel workflow builder showing the subscription refill reminder from the pipeline stage trigger through the reminder email, wait and paid checks', caption: 'The refill sequence in GoHighLevel.' },
      2: { alt: 'Close-up of the refill checks: Paid Branch and None, then a second check after SMS and two days with Paid Tag Present and None', caption: 'The two checks. Customers who reorder get nothing more.' },
      3: { alt: 'GoHighLevel refill reminder email step open in the editor with the reorder message', caption: 'The reminder email.' },
      4: { alt: 'GoHighLevel trigger settings: pipeline stage changed to Refill Due in the Subscribers pipeline with status open', caption: 'The trigger. The stage change starts the sequence.' }
    }
  },

  {
    slug: 'ai-powered-lead-tracking-and-follow-ups',
    category: 'Lead & Sales',
    title: 'Lead tracking that logs each lead in Notion, sends a thank you and follows up after three days',
    cardTitle: 'Lead tracking and follow-ups',
    summary: 'New leads in a Google Sheet are recorded in Notion, thanked by message through Twilio, marked as processed, and emailed through Gmail if they are still pending after three days.',
    description: 'How we built lead tracking that records each new lead in Notion, sends a thank you through Twilio, and follows up by Gmail when a lead is still pending.',
    problem: [
      'New leads were landing in a Google Sheet with nothing tracking them, no acknowledgement and no follow up unless someone remembered to send one.'
    ],
    how: [
      { p: 'The workflow starts when a new row is added to the Google Sheet with the lead\'s name, email, phone and a status of Pending. Only rows not yet processed go through.' },
      { ol: [
        'Clean the data. Phone numbers are put into international format and a timestamp is added.',
        'Create a page in the Notion Leads database with the name, email, phone, status, created time and sheet row ID.',
        'Send a thank you message through Twilio.',
        'Mark the sheet row as processed and store the Notion page ID and the time the message was sent.'
      ] },
      { p: 'A separate workflow runs once a day. It finds leads still marked Pending after three days and sends a follow-up email through Gmail.' },
      { img: 1 },
      { img: 2 },
      { img: 3 },
      { img: 4 }
    ],
    human: [
      'Talking to the lead once they reply.',
      'Updating a lead\'s status in Notion as the conversation moves on.'
    ],
    tools: ['n8n', 'Google Sheets', 'Notion', 'Twilio', 'Gmail'],
    builtWith: 'n8n, Google Sheets as the intake, Notion as the lead database, Twilio for the thank you message and Gmail for the follow-up.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/lead-follow-up', text: 'Automatic lead follow-up' }],
    imgs: {
      1: { alt: 'n8n workflows: a Google Sheets trigger that filters, parses, creates a Notion page, sends a message through Twilio and updates the sheet, and a scheduled workflow that queries Notion and sends a Gmail follow-up', caption: 'Both workflows. The top one handles new leads, the bottom one runs daily.' },
      2: { alt: 'Notion Leads database with one lead marked Pending, with the name, email, phone and workspace details blurred', caption: 'The lead record in Notion. Personal details are blurred.' },
      3: { alt: 'Google Sheet of leads with status, processed flag, Notion page ID and message sent time, with personal details blurred', caption: 'The sheet row after processing.' },
      4: { alt: 'WhatsApp chat with the Twilio sender showing the thank you message sent to a new lead, with the sandbox code, number and name blurred', caption: 'The thank you message as the lead receives it.' }
    }
  },

  {
    slug: 'restaurant-ordering-chatbot',
    category: 'Chat & Support',
    title: 'A chatbot for a fast food restaurant that answers from the latest menu',
    cardTitle: 'Restaurant ordering chatbot',
    summary: 'It keeps itself up to date from files in Google Drive and uses them to answer menu questions, help with orders and give restaurant details.',
    description: 'How we built a RAG chatbot for a fast food restaurant that updates itself from Google Drive and answers menu, ordering and opening hours questions.',
    problem: [
      'Customers ask the same things about the menu, prices, opening hours and orders. Keeping a chatbot\'s answers right every time the menu changes is the hard part.'
    ],
    how: [
      { ol: [
        'When a new file is added to the restaurant\'s Google Drive folder, such as an updated menu, the workflow starts.',
        'It downloads the file.',
        'Google Gemini turns the content into embeddings the chatbot can search.',
        'The data is stored in Pinecone, so answers can be found quickly.',
        'When a customer asks a question, the chatbot searches that data and replies.'
      ] },
      { img: 1 },
      { img: 2 },
      { p: 'The chatbot helps customers order, customise their meals and answer common questions such as store hours and promotions.' },
      { img: 3 },
      { img: 4 }
    ],
    human: [
      'Updating the menu file. The chatbot picks up the change from Drive.',
      'Preparing and delivering the orders.'
    ],
    tools: ['n8n', 'Google Drive', 'Google Gemini', 'Pinecone', 'RAG'],
    builtWith: 'n8n, Google Drive as the source of menu files, Google Gemini for embeddings and replies, and Pinecone as the vector store.',
    service: { href: '/services/rag-knowledge-base', text: 'Knowledge base and RAG agents' },
    posts: [{ href: '/blog/ai-website-chat', text: 'AI website chat' }],
    imgs: {
      1: { alt: 'Menu sheet with item name, category, description, price and calories for burgers and wraps', caption: 'Part of the menu the chatbot learns from.' },
      2: { alt: 'Pinecone index settings showing cosine metric, 768 dimensions, AWS us-east-1, serverless and a record count of 123, with the host URL blurred', caption: 'The Pinecone index holding the menu data. The host URL is blurred.' },
      3: { alt: 'Chat window where a customer asks about opening hours and the chatbot replies with the hours, with the session ID and restaurant name blurred', caption: 'A customer asking about opening hours.' },
      4: { alt: 'n8n chat agent workflow: chat trigger, AI agent with a Google Gemini chat model, simple memory and a vector store tool backed by Pinecone and Gemini embeddings', caption: 'The chatbot in n8n.' }
    }
  },

  {
    slug: 'ai-call-meeting-scheduling',
    category: 'Scheduling & Ops',
    title: 'Automatic prospect calls and meeting booking for a sales team',
    cardTitle: 'AI prospect calls and meeting scheduling',
    summary: 'An AI assistant calls every prospect marked Not Called, logs the outcome in the sheet, and books a meeting for interested prospects at the time they prefer.',
    description: 'How we automated prospect calls with Vapi and Make: every call outcome is logged in the sheet and interested prospects are booked into a meeting.',
    problem: [
      'Every morning the team opened a Google Sheet of prospects marked Not Called. Someone picked a number, dialled, noted whether a person or voicemail answered and whether they were interested, then typed it all into the sheet.',
      'Interested prospects then needed emails to agree a time, sometimes several just to settle morning or evening. Good leads slipped through when the team got busy.'
    ],
    how: [
      { p: 'The system checks the sheet for anyone marked Not Called. Vapi, an AI voice assistant, places the call, so nobody dials. When the call ends, Vapi sends the details back to the sheet: who picked up, whether they were interested and any notes.' },
      { img: 1 },
      { p: 'If the prospect is interested, ChatGPT reads the call notes, works out whether they prefer mornings or evenings, and books the meeting at a suitable time, with the invite sent by email through Gmail.' },
      { img: 2 }
    ],
    human: [
      'The meetings themselves, and closing the deals.',
      'Prospects who ask questions the call could not answer.'
    ],
    tools: ['Make', 'Vapi', 'OpenAI', 'Google Sheets', 'Gmail'],
    builtWith: 'Make for the scenarios, Vapi for the calls, OpenAI for reading the notes and choosing the time, Google Sheets for the prospect list and Gmail for the invites.',
    service: { href: '/services/ai-automation', text: 'AI agents and automation' },
    posts: [{ href: '/blog/automatic-appointment-booking', text: 'Automatic appointment booking' }],
    imgs: {
      1: { alt: 'Make scenario with three modules: get data from Google Sheets, make the call through an HTTP request, and get the call from Vapi', caption: 'The calling scenario in Make.' },
      2: { alt: 'Make scenario: webhook, set data, search records, then a router with paths that generate meeting data with OpenAI and book the meeting, add a new record, or update an existing record', caption: 'The follow-up scenario. The router books meetings for interested prospects and updates the sheet for the rest.' }
    }
  },

  /* ---------- thin builds: page only, noindex, not listed ---------- */

  {
    slug: 'ai-ticket-triage-n8n-fastapi',
    noindex: true,
    category: 'Chat & Support',
    title: 'Support ticket triage with n8n and a FastAPI classifier',
    cardTitle: 'Support ticket triage with n8n and FastAPI',
    summary: 'n8n sends a batch of tickets to a FastAPI endpoint, gets back a category, priority, sentiment and suggested team for each, and routes them by priority.',
    description: 'How we built support ticket triage with n8n and FastAPI: each ticket comes back with a category, priority, sentiment and team, and is routed by priority.',
    problem: ['Support tickets arrive mixed together. Someone has to read each one to decide how urgent it is and who should take it.'],
    how: [
      { p: 'n8n handles the orchestration: the trigger, the HTTP call, parsing and routing. FastAPI does the classification.' },
      { ol: [
        'Load the tickets.',
        'Send them to the FastAPI /classify endpoint.',
        'Parse the result for each ticket: category, priority, sentiment and suggested team.',
        'Route P1 tickets to the escalation queue, P2 to the team queue and P3 to the backlog.',
        'Write a triage summary.'
      ] },
      { p: 'The endpoint takes a list of tickets with an ID, subject, body and customer tier, and returns one result per ticket. It uses Pydantic models for the request and response, and the classifier is a slot for a Claude or OpenAI call.' },
      { h3: 'Verified run' },
      { p: 'A live run returned HTTP 200 and classified 10 tickets: 3 P1, 3 P2 and 4 P3. By category there were 3 billing, 3 technical, 3 account and 1 general. Calling the endpoint directly gave the same results. The run used a public echo service in place of the deployed FastAPI app.' }
    ],
    human: ['P1 tickets in the escalation queue.', 'Checking the classifier when a ticket looks mislabelled.'],
    tools: ['n8n', 'FastAPI', 'OpenAI', 'Claude'],
    builtWith: 'n8n for the trigger, HTTP request, parsing and routing, FastAPI with Pydantic models for the endpoint, and httpx. Pointing the request at the deployed app makes it fully live.',
    service: { href: '/services/ai-automation', text: 'AI agents and automation' },
    posts: [PILLAR],
    imgs: {}
  },

  {
    slug: 'ats-data-quality-and-job-ageing-audit-jobadder',
    noindex: true,
    category: 'Recruitment',
    title: 'A daily data quality and job ageing audit for JobAdder',
    cardTitle: 'JobAdder data quality and job ageing audit',
    summary: 'Each morning it checks every active job in JobAdder, flags what recruiters miss, and routes high severity issues to Slack and a review task.',
    description: 'How we built a daily JobAdder audit that flags timed-out jobs, missing data and stale activity, scores data quality, and routes high severity issues to Slack.',
    problem: ['Recruitment systems fill with jobs that have aged out, missing salaries, missing client contacts, unsigned terms and jobs with no submissions. Nobody checks every job every day, so the problems stay hidden.'],
    how: [
      { ol: [
        'Load the thresholds.',
        'Read the active jobs from JobAdder.',
        'Check each job against each rule.',
        'Keep only the exceptions.',
        'Send high severity issues to Slack and create a JobAdder review task.',
        'Write a run report.'
      ] },
      { h3: 'The rules' },
      { ul: [
        'Ageing: fresh, ageing, stale or critical. An open job past 60 days is timed out.',
        'Data quality: missing salary, missing client contact, unsigned terms, no submissions after a week, and no activity for 21 days or more.',
        'Severity: high if timed out, terms unsigned or three or more issues, otherwise medium. High goes to Slack and a review task, medium to the owner\'s task queue.',
        'Score: clean active jobs divided by active jobs, so it can be tracked week to week.'
      ] },
      { h3: 'Verified run' },
      { p: 'A live run checked 12 active jobs. 3 were clean and 9 were flagged, a data quality score of 25%. 3 jobs had timed out. 5 issues were high severity and 4 medium. The run used sample data in place of the live JobAdder read.' }
    ],
    human: ['Fixing each flagged job.', 'Setting the thresholds.'],
    tools: ['n8n', 'JobAdder', 'Slack'],
    builtWith: 'n8n with schedule and manual triggers, the JobAdder API for jobs and tasks, and Slack for high severity alerts.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/automated-client-reporting', text: 'Automated client reporting' }],
    imgs: {}
  },

  {
    slug: 'heli-pilot-scheduling',
    noindex: true,
    category: 'Scheduling & Ops',
    title: 'Helicopter and pilot scheduling from Bokun bookings to Google Calendar',
    cardTitle: 'Helicopter and pilot scheduling',
    summary: 'It assigns each confirmed booking to a helicopter and a pilot, keeps pilot workloads even across the month, respects time off, and never changes a booking a person has edited.',
    description: 'How we built deterministic helicopter and pilot scheduling from Bokun to Google Calendar, with balanced pilot loads and manual changes that are never overwritten.',
    problem: ['A helicopter tour operator with 5 helicopters and 6 pilots needed bookings scheduled automatically. Pilot loads had to stay even, days off and rest gaps had to hold, and manual changes, such as weather postponements, could never be overwritten by the automation.'],
    how: [
      { p: 'Every decision uses fixed, explainable rules rather than an AI model, so the same bookings always produce the same schedule.' },
      { ul: [
        'Helicopter: a hash of the booking ID picks a starting helicopter, then the first one free for that slot. It looks random, is fully reproducible and never double books an aircraft.',
        'Pilot: from pilots on duty, free at that time and clear of the rest gap, it picks the one with the fewest tours that month, then the one whose day stays most compact.',
        'Memory: bookings already placed or locked by a person are skipped on every run, so re-running never moves or reverts an event.',
        'Exceptions: a booking no pilot can take is flagged instead of being assigned badly.'
      ] },
      { h3: 'Verified run' },
      { p: 'A live run took 10 new bookings. 8 were scheduled and 2 were skipped as already placed, with no conflicts. Re-running produced an identical plan. Days off held: a pilot who is off on Mondays only received Tuesday and Wednesday tours. New work went to the pilots with the lightest load. The run used sample data.' }
    ],
    human: ['Weather postponements and cancellations, which the system leaves alone.', 'Bookings flagged as exceptions.', 'Any manual change to the calendars.'],
    tools: ['n8n', 'Bokun', 'Google Calendar'],
    builtWith: 'n8n, the Bokun booking API and Google Calendar across 5 helicopter and 6 pilot calendars. Enabling the Bokun and Calendar steps with credentials makes it live. The same logic can be rebuilt in Make.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/automatic-appointment-booking', text: 'Automatic appointment booking' }],
    imgs: {}
  },

  {
    slug: 'candidate-re-engagement-jobadder',
    noindex: true,
    category: 'Recruitment',
    title: 'Candidate follow-up and re-engagement for recruiters using JobAdder',
    cardTitle: 'Candidate re-engagement for JobAdder',
    summary: 'It reads candidates and open jobs from JobAdder, decides who each recruiter should contact today and why, drafts the message and creates a task.',
    description: 'How we built candidate re-engagement for JobAdder: fixed rules pick who to contact and why, Claude polishes the message, and each consultant gets a task.',
    problem: ['Recruiters have more past candidates than they can keep in touch with. Strong matches for new roles get missed, and good candidates go quiet because nobody followed up.'],
    how: [
      { p: 'Fixed rules decide who to contact and why, so the targeting is the same on every run and can be audited. Claude only polishes the wording.' },
      { ul: [
        'Eligibility: skip anyone interviewing or placed in the last 90 days.',
        'Skill match: two or more shared skills with an open job makes a high priority pitch for that role.',
        'Recency: otherwise, no contact for 30 days or more triggers a medium priority re-engagement.',
        'Output: a personal message naming the role and the shared skills, plus a JobAdder task for the candidate\'s consultant.'
      ] },
      { h3: 'Verified run' },
      { p: 'A live run took 12 candidates. 8 were actioned, 5 skill matched pitches and 3 re-engagements, and 4 were correctly skipped because they were interviewing, recently placed or recently contacted. Re-running gave identical output. The run used sample data.' }
    ],
    human: ['Sending each message, or editing it first.', 'The conversation with the candidate.'],
    tools: ['n8n', 'JobAdder', 'Claude'],
    builtWith: 'n8n, the JobAdder API for candidates, jobs and tasks, and Claude for the wording.',
    service: { href: '/services/ai-automation', text: 'AI agents and automation' },
    posts: [{ href: '/blog/lead-follow-up', text: 'Automatic lead follow-up' }],
    imgs: {}
  },

  {
    slug: 'event-driven-order-automation-fastapi-n8n',
    noindex: true,
    category: 'Commerce',
    title: 'Order automation triggered by a FastAPI backend through an n8n webhook',
    cardTitle: 'Event-driven order automation with FastAPI and n8n',
    summary: 'A FastAPI app posts each new order to n8n, which checks it, enriches it, routes it and answers with a structured response.',
    description: 'How we built event-driven order automation: FastAPI posts each order to an n8n webhook that validates it, routes it and replies with a structured response.',
    problem: ['Order rules change more often than the application that takes the order. This build hands validation and routing to n8n, triggered by a webhook from the FastAPI backend.'],
    how: [
      { ol: [
        'FastAPI posts a new order to the n8n webhook.',
        'n8n normalizes the order.',
        'It recomputes the total from the line items and compares it with the declared total, checks the required fields, flags high value orders, and assigns a fulfillment route and a response time.',
        'Valid orders get a 200 response with the routing. Invalid ones get a 400 with the exact issues.'
      ] },
      { h3: 'Verified run' },
      { p: 'A simulated order totalling 500 matched its declared total, was flagged as high value, routed to priority fulfillment with a 4 hour target, and returned 200. An order with a bad email, no items or a mismatched total takes the other branch and returns 400 with the list of issues.' }
    ],
    human: ['Orders rejected by validation.', 'Setting the routing rules and targets.'],
    tools: ['n8n', 'FastAPI', 'Webhooks'],
    builtWith: 'n8n with a webhook trigger, code and IF steps and a webhook response, FastAPI with Pydantic models, and httpx to fire the webhook.',
    service: { href: '/services/industries/ecommerce', text: 'Ecommerce automation for multi-channel stores' },
    posts: [{ href: '/blog/where-is-my-order-automation', text: 'Where is my order, answered before they ask' }],
    imgs: {}
  },

  {
    slug: 'payroll-and-invoice-validation-engine',
    noindex: true,
    category: 'Documents & Finance',
    title: 'Line-by-line payroll and invoice validation with an exception queue',
    cardTitle: 'Payroll and invoice validation',
    summary: 'Every row is checked against seven rules. Clean rows and exceptions go to separate queues, a summary goes to Slack and Gmail, and every decision is logged.',
    description: 'How we built line-by-line payroll and invoice validation in n8n: seven checks per row, an exception queue, a summary in Slack and Gmail, and a full audit log.',
    problem: ['Payroll and invoice data goes wrong at the line, not the total. Negative hours, a duplicated shift, tips far out of line with sales, a rate that does not match the role, a shift outside the pay period. Each can pass a totals check and still be wrong. Reviewing every line by hand is slow, so errors reach the pay run.'],
    how: [
      { ol: [
        'Normalize: trim, convert numbers, and stamp each row with its line number.',
        'Validate each row against the checks below.',
        'Route clean rows to the validated output and failures to the exception queue.',
        'Post a summary to Slack and Gmail and write every row to an audit log.'
      ] },
      { h3: 'The checks' },
      { ul: [
        'Employee ID present.',
        'Date inside the pay period.',
        'Hours between 0 and 16.',
        'Rate matches the role table.',
        'Tips no more than 40% of sales.',
        'No duplicate employee, date and pay component.',
        'No employee with two roles in one shift.'
      ] },
      { h3: 'Verified run' },
      { p: 'A live run checked 30 rows. 22 passed and 8 were exceptions, and each planted error tripped exactly one rule. The exception queue shows the line number, the employee, the rule in plain English and the raw values, for example hours logged as negative 5, or $250 in tips on $90 of sales.' }
    ],
    human: ['Reviewing and correcting each exception.', 'Approving the pay run.'],
    tools: ['n8n', 'Google Sheets', 'Slack', 'Gmail'],
    builtWith: 'n8n with code steps, Google Sheets for the input and the output queues, and Slack and Gmail for the summary.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/ai-document-data-extraction', text: 'AI document data extraction' }],
    imgs: {}
  },

  {
    slug: 'recruitment-dashboard-jobadder',
    noindex: true,
    category: 'Recruitment',
    title: 'A recruitment reporting API and dashboard for JobAdder',
    cardTitle: 'Recruitment dashboard and reporting API for JobAdder',
    summary: 'One webhook with four actions returns headline metrics, a consultant leaderboard, the pipeline by age, or a live HTML dashboard.',
    description: 'How we built a recruitment reporting API for JobAdder: one webhook returns metrics, a consultant leaderboard, the pipeline by age or an HTML dashboard.',
    problem: ['Managers need the numbers behind the desk: new and active jobs, ageing, submissions, interviews, placements, revenue, consultant performance, time to fill and timed out jobs. Pulling them together by hand takes time every week.'],
    how: [
      { p: 'One webhook takes an action and returns the answer.' },
      { ul: [
        'metrics: every headline number as JSON.',
        'consultants: a leaderboard ranked by revenue and placements.',
        'pipeline: open jobs grouped by age.',
        'dashboard: a self-contained HTML screen built from the live numbers.'
      ] },
      { h3: 'Verified run' },
      { p: 'Four live calls over a sample month of 30 jobs returned 10 placements, revenue of 177,000, an average time to fill of 37 days, 14 open jobs and 3 timed out. There were 123 submissions and 56 interviews.' }
    ],
    human: ['Reading the numbers and acting on them.', 'Connecting the loader to the live JobAdder account.'],
    tools: ['n8n', 'JobAdder', 'Webhooks'],
    builtWith: 'n8n with a webhook, code and switch steps, the JobAdder API, and a self-contained HTML and CSS dashboard with no separate hosting.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/automated-client-reporting', text: 'Automated client reporting' }],
    imgs: {}
  },

  {
    slug: 'scheduling-backoffice-stats-api',
    noindex: true,
    category: 'Scheduling & Ops',
    title: 'A scheduling back office with stats, safe reassignment and locked manual changes',
    cardTitle: 'Scheduling back office and stats API',
    summary: 'One webhook gives an operator workload stats, a safe way to reassign a booking, the full roster and an HTML dashboard. Every manual change is locked so the scheduler never reverts it.',
    description: 'How we built a scheduling back office: workload stats, safe booking reassignment with checks, and locks that stop the auto scheduler undoing manual changes.',
    problem: ['An operator running automatic scheduling still needs to see workload at a glance, move a booking by hand, and know the automation will not undo that change.'],
    how: [
      { p: 'One webhook takes an action and returns the answer.' },
      { ul: [
        'stats: tours, hours, passengers and days worked per helicopter and per pilot, plus the gap between the busiest and quietest.',
        'reassign: checks the new pilot is not off and that neither the pilot nor the helicopter is double booked. If it passes, the booking is locked and marked as a manual override.',
        'roster: the full schedule in time order with lock flags.',
        'dashboard: a self-contained HTML screen.'
      ] },
      { p: 'A locked booking is skipped by the auto scheduler from then on. Weather postponements and cancellations are left alone the same way.' },
      { h3: 'Verified run' },
      { p: 'Four live calls: stats over a 40 tour month, a valid reassignment that locked the booking, a reassignment to a pilot on their day off that was correctly rejected, and the dashboard served as HTML.' }
    ],
    human: ['Every reassignment decision.', 'Weather calls and cancellations.'],
    tools: ['n8n', 'Google Sheets', 'Webhooks'],
    builtWith: 'n8n with a webhook, code and switch steps, and a self-contained HTML and CSS dashboard. It shares the fleet rules with the auto scheduler, so the two always agree. The same build can be recreated in Make.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/automatic-appointment-booking', text: 'Automatic appointment booking' }],
    imgs: {}
  },

  {
    slug: 'two-source-reconciliation-workflow',
    noindex: true,
    category: 'Documents & Finance',
    title: 'Two-source reconciliation that matches financial records line by line',
    cardTitle: 'Two-source reconciliation',
    summary: 'It matches a POS export against a bookkeeper\'s sheet row by row, classifies every gap, and writes a discrepancy report with a plain English summary.',
    description: 'How we built a two-source reconciliation in n8n: POS and bookkeeper records matched line by line, every gap classified, and a plain English readout.',
    problem: ['Two systems that should agree drift apart. Hours are rounded differently, tips are keyed wrong, a shift is missing on one side, and one employee ID appears with two different names. Totals can still match while the lines do not, and finding the gaps by eye across hundreds of rows is work that gets skipped.'],
    how: [
      { ol: [
        'Build a key of employee ID and date for every row in both sources.',
        'Walk every key. Where both sides have it, compare field by field: hours within 0.1 of an hour pass, tips and sales must match to the cent. Where one side lacks it, mark it missing in the POS or missing in the books. Where the ID matches but the name differs, flag an identity mismatch.',
        'Write one row per discrepancy and a summary with counts and the total dollar difference.',
        'Optionally, Claude turns the list into a short readout for a manager.'
      ] },
      { h3: 'Verified run' },
      { p: 'The run found hours mismatches beyond the tolerance, tips mismatches, shifts missing from the bookkeeper\'s sheet and from the POS, and an identity mismatch, with a net tips difference of $55.00. A difference of 0.05 of an hour correctly passed the tolerance.' },
      { p: 'The identity mismatch is the one most checks miss. The ID matched, so the numbers reconciled, but the same ID carried two versions of a name across the two systems.' }
    ],
    human: ['Investigating and correcting each discrepancy.', 'Deciding which source is right when they disagree.'],
    tools: ['n8n', 'Google Sheets', 'Slack', 'Gmail', 'Claude'],
    builtWith: 'n8n with code steps, Google Sheets for the two sources and the report, Slack and Gmail for the summary, and Claude for the readout.',
    service: { href: '/services/workflow-automation', text: 'Workflow automation' },
    posts: [{ href: '/blog/ai-document-data-extraction', text: 'AI document data extraction' }],
    imgs: {}
  },

  {
    slug: 'meeting-action-items-follow-ups',
    noindex: true,
    category: 'Scheduling & Ops',
    title: 'Meeting follow-ups that turn notes into tasks and contact updates',
    cardTitle: 'Meeting action items and follow-ups',
    summary: 'When a meeting ends, the action items go into ClickUp as assigned tasks and the notes go to the contact\'s record in ActiveCampaign.',
    description: 'How we automated meeting follow-ups: Fathom notes become assigned ClickUp tasks, and contact records in ActiveCampaign are updated or created.',
    problem: ['The team held many meetings a week: internal check-ins, project discussions and client calls. After each one someone rewatched the recording or read the Fathom notes, copied action items into ClickUp, assigned them, wrote a summary email for external contacts and checked nothing was missed. That took 20 to 30 minutes per meeting, and action items still slipped and client updates arrived days late.'],
    how: [
      { ol: [
        'Fathom identifies the key notes and action items.',
        'The items go to ClickUp, where tasks are created and assigned to the right people.',
        'The notes are added to the contact\'s record in ActiveCampaign. If the person is not in the system yet, a new contact is created.'
      ] },
      { p: 'It runs in the background after every meeting. What took 20 to 30 minutes now happens in seconds.' },
      { img: 1 }
    ],
    human: ['Doing the tasks.', 'Checking the notes Fathom picked up.'],
    tools: ['Make', 'Fathom', 'ClickUp', 'ActiveCampaign'],
    builtWith: 'Make for the scenario, Fathom for the meeting notes, ClickUp for tasks and ActiveCampaign for contacts.',
    service: { href: '/services/ai-automation', text: 'AI agents and automation' },
    posts: [PILLAR],
    imgs: {
      1: { alt: 'Make scenario: an HTTP trigger and ClickUp step, then a router with an internal meeting path that creates ClickUp tasks and an external path that updates or creates ActiveCampaign contacts', caption: 'The follow-up scenario in Make.' }
    }
  }
];

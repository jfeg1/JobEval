/**
 * The default factor and subfactor plan from EIGE, "EU-wide guidelines on
 * gender-neutral job evaluation and classification: Step-by-step toolkit",
 * Factor and subfactor plan, and its supporting Excel files (Tools 3 to 5).
 * Subfactor text is reproduced from the toolkit (generated from its PDF).
 * The effort and working-conditions introductions are short summaries.
 *
 * Default weights (Tool 5, sheet 4): skills 40, responsibility 35, effort 15,
 * working conditions 10, out of 1,200 points. Levels run 0 to 5; knowledge
 * runs 0 to 8 to follow the European qualifications framework.
 */
import type { SubfactorDef } from "./plans";

export const EIGE_TOTAL_POINTS = 1200;

export const EIGE_FACTOR_INTROS: Record<string, string> = {
  skills: "Skills comprise the knowledge, abilities and attitudes required to do a job.",
  responsibility: "A job may require different kinds of responsibility, sometimes simultaneously.",
  effort: "Effort covers the mental, psychosocial and emotional, and physical demands of the job.",
  conditions:
    "Working conditions are the characteristics of the work process and environment that affect the person doing the job. How significant they are depends on how long and how often the worker is exposed to them and whether they can influence them. Assume that health and safety rules are observed.",
};

export const EIGE_SUBFACTORS: SubfactorDef[] = [
  {
    id: "knowledge",
    code: "1.1",
    factor: "skills",
    name: "Knowledge",
    weight: 12,
    definition:
      "This subfactor assesses the level of experience, formal education, training and basic skills necessary to meet the requirements of a job. Skills and knowledge may be learned on the job, off the job and/or through education.",
    questions: [
      {
        topic: "Type and complexity",
        question:
          "Is the knowledge required technical, professional, organisational or cultural? Does it involve theoretical knowledge (e.g. academic concepts) or practical expertise (e.g. hands-on skills)?",
      },
      {
        topic: "Breadth of knowledge",
        question:
          "Is the knowledge required siloed or does it span multiple domains? Does the job require the integration of knowledge across different fields?",
      },
      {
        topic: "Depth of knowledge",
        question:
          "How complex are the ideas or concepts involved (e.g. foundational, intermediate or advanced level)? Does the job entail generating new knowledge, innovating or making theoretical contributions?",
      },
      {
        topic: "Autonomy in applying knowledge",
        question:
          "To what extent does the job require its holder to apply knowledge independently or to make decisions based on expert judgement?",
      },
      {
        topic: "Ongoing learning",
        question:
          "Does the job require the regular updating of knowledge, professional development or continuing education in order to stay current?",
      },
    ],
    levels: [
      "Does not apply.",
      "Basic general knowledge. The job requires basic knowledge to carry out simple tasks.",
      "Basic factual knowledge of a field of work. The job requires simple thinking and practical knowledge to use information, complete tasks and solve routine problems using basic rules and tools.",
      "Knowledge of facts, principles and general ideas in a job area. The job requires a range of thinking and practical knowledge to do tasks and solve problems by choosing and using basic methods, tools, materials and information.",
      "Factual and theoretical knowledge in broad contexts within a field of work. The job requires a range of thinking and practical knowledge to find solutions to specific problems in the job or study area.",
      "Specialised and theoretical knowledge within a field of work and an awareness of the limits of that knowledge. The job requires a comprehensive range of cognitive and practical knowledge to develop creative solutions to abstract problems.",
      "Advanced knowledge of a field of work with a deep understanding of theories and principles. The job requires high-level knowledge, showing expertise and practical knowledge, to solve complex and unexpected problems within a specialised area.",
      "Very specialised knowledge, including the newest ideas in the field. The job requires deep awareness of knowledge issues within and between fields. Specialised skills are needed for research and innovation to create new knowledge and combine knowledge from different areas.",
      "Knowledge at the highest, most advanced level in a field and where fields overlap. The job requires the most advanced and specialised knowledge, including combining and judging ideas, to solve critical research and innovation problems and expand or change existing knowledge or professional practice.",
    ],
    mistakes: [
      "An individual job holder may have a high level of knowledge but, if this is not actually required to do the job, it should not be considered in the job evaluation (New Zealand Government, 2021b).",
      "Avoid only recognising university degrees or technical certificates.",
      "Avoid disregarding knowledge in women-dominated jobs as ‘common sense’ or ‘intuition’.",
      "Do not assume that the most common or majority culture (e.g. the main language spoken or the local way of doing things) is the only essential or valid knowledge.",
      "Do not focus only on knowledge of technical systems, machinery or scientific expertise while forgetting about procedural, organisational or contextual knowledge.",
    ],
    howToAct: [
      "Ask what knowledge is needed to do the job well, not what degree the current job holder has.",
      "Credit knowledge gained through on-the-job experience, caregiving, volunteering, self-study or community leadership.",
      "Value the knowledge required to work effectively with diverse groups, including people from diverse cultural backgrounds, of different ages or in various languages.",
    ],
    example:
      "Think about how a school psychologist needs expert knowledge of child and adolescent development and mental health, and of how to support students with differing needs. Their job includes creating strategies to help students do well, both in school and emotionally. A key skill for a psychologist is observation, which is the ability to notice behaviours, emotional cues and non-verbal signals that are essential for diagnosing and helping students. Similarly, working with children from diverse backgrounds, such as those from migrant or ethnic minority groups, requires more than just empathy. It involves cultural awareness and understanding of how to meet each student’s unique needs. These skills are developed through years of study, training and practical experience – they are not just something that comes naturally. This job fits level 7 because it requires deep knowledge of psychology and the ability to think and act critically in different situations. However, the full complexity of this job can be overlooked in a job evaluation if we focus mainly on technical skills or assume that certain skills are just the natural abilities of the job holder.",
  },
  {
    id: "communication",
    code: "1.2",
    factor: "skills",
    name: "Interpersonal and communication skills",
    weight: 8,
    definition:
      "This subfactor assesses the requirement to deal with people both within and outside the organisation. It considers the type, importance and purpose of contacts and the degree of interpersonal skills required. It accounts for the skills needed to motivate, negotiate, persuade, influence and inspire others, make presentations, exchange information and provide instructions. It is important to consider face-to-face interaction and the skills needed to communicate clear ideas, messages or concepts online, in print or on the phone (New Zealand Government, 2021b).",
    questions: [
      {
        topic: "Depth and complexity",
        question:
          "What is the nature of the communication? How complex is the information being communicated?",
      },
      {
        topic: "Purpose of interaction",
        question:
          "Does the job primarily involve sharing information, training or instructing others, or influencing and changing opinions or behaviours?",
      },
      {
        topic: "Communication with others",
        question:
          "Does the job require communication with internal teams, clients, patients, victims of trauma, stakeholders or external partners?",
      },
      {
        topic: "Types of communication",
        question:
          "Does the job involve written communication (e.g. reports, emails), verbal communication (e.g. meetings, presentations) or both? Are multilingual or multicultural communication skills required? Does the role rely on non-verbal communication skills (e.g. active listening, body language awareness, tone of voice or visual cues) to support effective interaction?",
      },
      {
        topic: "Collaboration and teamwork",
        question:
          "How often does the job require cooperation with colleagues, working within a team or facilitating group decision-making processes?",
      },
      {
        topic: "Autonomy",
        question:
          "To what extent is the job holder expected to independently manage communication and foster relationships without guidance from others?",
      },
    ],
    levels: [
      "Not applicable.",
      "Basic communication and interpersonal skills required. The job requires the ability to share simple information clearly and to show courtesy and respect in simple interactions.",
      "Standard communication and interaction with others. The job holder is required to communicate with colleagues or customers in structured settings. Tact, empathy and basic relationship building are required.",
      "Effective communication and interpersonal relationships. The job holder is required to adapt communication to different audiences and foster trust, cooperation and positive working relationships.",
      "Advanced communication and interpersonal skills. The job holder is required to manage complex interactions, mediate interpersonal conflicts and support group collaboration.",
      "Strong communication and interpersonal skills. The job holder is required to lead communication strategies, influence decisions, manage complex communications and cultivate inclusive, high-trust environments that influence and inspire others.",
    ],
    mistakes: [
      "Don’t assume that skills such as calming upset patients, listening with empathy or keeping team morale high are just natural talents or are easy to do.",
      "Don’t treat conversations with senior leaders as more valuable than those with clients, patients or students.",
      "Don’t favour bold, confident or ‘executive-style’ communication over quieter approaches that require the job holder to listen, observe or support others.",
      "Don’t overlook communication that happens in more than one language or is shaped by different cultural norms.",
    ],
    howToAct: [
      "It does not matter whether people are born with these skills or learn them. If the job requires them, they should count as part of the job.",
      "Focus on what communication is needed in the job, how often it is used and why it matters – not on the individual’s personal communication style.",
      "Think broadly about communication skills, including abilities such as active listening and reading body language.",
      "Value the ability to communicate with people who come from diverse cultural backgrounds, are of different ages or communicate in various languages.",
    ],
    example:
      "Think about how customer service representative jobs, often held by women, require clear communication with a wide range of customers. These workers handle complaints, explain solutions and adapt their communication style depending on the situation. They also need to stay calm and independently manage demanding or upset customers. The communication happens in person or by phone and requires strong courtesy and tact. This job fits level 3 because it demands effective communication, the independent handling of interactions and clear information sharing. These essential skills in relation to communication can sometimes be undervalued or dismissed as ‘soft skills’, reflecting a gender bias that can lead to unfair job evaluations.",
  },
  {
    id: "problemSolving",
    code: "1.3",
    factor: "skills",
    name: "Problem-solving skills",
    weight: 8,
    definition:
      "This subfactor assesses the problem-solving skills and judgement required on the job. It assesses the level of difficulty involved in identifying options and exercising judgement to select the most appropriate action. It considers mental processes such as analysis, reasoning or evaluation. It reflects the complexity and unpredictability of the problems encountered, the degree of original thinking or analysis required, and the extent to which the job holder must independently develop solutions rather than apply established procedures.",
    questions: [
      {
        topic: "Types of problems",
        question:
          "What kinds of problems does the job face? Do they require innovative thinking, or can they be solved using predefined methods or procedures?",
      },
      {
        topic: "Autonomy",
        question:
          "How much independence does the job holder have in solving problems? Does the job require decision-making that affects outcomes directly, or is it guided by set protocols?",
      },
      {
        topic: "Complexity",
        question:
          "How difficult or multifaceted are the problems involved? Do they require in-depth analysis, critical thinking and multidisciplinary knowledge?",
      },
      {
        topic: "Frequency",
        question:
          "How often do problems arise? Is problem-solving a core part of the job, or does it occur in specific situations?",
      },
      {
        topic: "Impact",
        question:
          "What is the consequence of the solution? How does it affect the worker, the team, the organisation or the customer?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any problem-solving. Tasks are routine, with no need for independent judgement or solutions.",
      "Routine problems. The job requires solving minor, routine problems that occur regularly. Solutions are already known and are easy to follow.",
      "Standard problems. The job involves solving problems with defined alternatives. Some judgement is needed, but help is usually available.",
      "Variable problems. The job involves dealing with different kinds of problems that require careful thinking, research into different options or adjusting existing ways of doing things. Guidance and resources may be limited.",
      "Non-standard problems. The job involves solving complex, non-standard problems involving multiple factors to consider. Solutions often require careful analysis and the adaptation of current methods.",
      "Complex problems. The job holder is required to solve highly complex, unique problems with no clear or predefined solutions. Innovative solutions are needed, requiring critical thinking.",
    ],
    mistakes: [
      "Do not equate complexity only with abstract or technical problems.",
      "Do not dismiss problem-solving in jobs that follow set procedures, particularly in women-dominated sectors.",
      "Avoid undervaluing problem-solving that relies on emotional labour or relational complexity.",
    ],
    howToAct: [
      "Acknowledge the judgement required in unpredictable, sensitive situations.",
      "Value adaptability, whereby workers interpret or balance conflicting procedures – especially in caregiving and service.",
    ],
    example:
      "Think about how a classroom assistant needs to notice when a child is upset, understand why by considering their feelings or background, and then adjust the teaching approach used accordingly. This goes beyond simply following formal teaching guidelines. It requires judgement and flexibility in order to solve problems and meet each child’s needs. Such problem-solving skills involve managing complex situations and are vital in many women-dominated jobs, though they are often undervalued.",
  },
  {
    id: "planning",
    code: "1.4",
    factor: "skills",
    name: "Planning and organisational skills",
    weight: 6,
    definition:
      "This subfactor assesses the ability to plan and organise tasks effectively. It includes time management, resource allocation and the ability to handle multiple projects simultaneously. It includes identifying needs, formulating objectives, planning for current and future operations, prioritising, project planning, assessing and analysing resources and needs, and monitoring the implementation of plans (Pay Equity Office, 2022).",
    questions: [
      {
        topic: "Type(s) of planning",
        question:
          "Does the job involve strategic planning (long-term goals and vision), operational planning (day-to-day tasks) or both?",
      },
      {
        topic: "Level of responsibility",
        question:
          "Is the job role responsible for creating, adjusting or overseeing the implementation of plans, or does it follow pre-established guidelines or structures?",
      },
      {
        topic: "Scope and impact of planning",
        question:
          "How wide-ranging are the plans? Do they affect a team, a department or an entire organisation?",
      },
      {
        topic: "Adaptability",
        question:
          "How often do plans need to be adjusted or modified in response to changing circumstances or emerging needs?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any planning or organisational skills.",
      "Limited planning required. Tasks are set by others or are predefined, with minimal need for adjustment.",
      "Basic organisational skills required. The job involves planning and organising one’s own work within set deadlines. Some input into scheduling and prioritisation of tasks.",
      "Moderate organisational skills required. The job requires the organising and prioritising of multiple tasks, with some level of adjustment to plans on the basis of changing circumstances or deadlines.",
      "Advanced organisational skills required. The job requires planning and managing complex, often overlapping tasks or schedules. The job requires a degree of autonomy and joint planning, and managing interdependencies across teams or departments.",
      "High-level planning and organisational skills required. The job requires the formulation of long-term strategic plans and the handling of uncertainty. It involves a high level of autonomy, requiring the defining of organisational direction through structured and forward- thinking planning.",
    ],
    mistakes: [
      "Do not dismiss planning and organisation as ‘soft skills’ or assume that they are abilities that come ‘naturally’ to women.",
      "Do not overlook planning skills in jobs traditionally seen as supportive or administrative.",
      "Do not assume that only formal project management titles or senior jobs require planning and organisational skills.",
    ],
    howToAct: [
      "Recognise planning and organisational skills as essential, learned abilities that require training and expertise.",
      "Make sure you value organisational skills in jobs that involve strategic, long-term planning and those that focus on organising daily tasks.",
    ],
    example:
      "Think about how an administrative assistant, often in a women-dominated job, manages multiple calendars, organises meetings and resolves scheduling conflicts behind the scenes. While such workers may not have formal managerial authority, their organisational and planning skills are essential to the smooth running of daily operations. Tasks include coordinating schedules, anticipating needs, managing workflows and balancing competing priorities.",
  },
  {
    id: "physicalSkills",
    code: "1.5",
    factor: "skills",
    name: "Physical skills",
    weight: 6,
    definition:
      "This subfactor assesses the physical and fine motor skills required for a job, focusing on manual dexterity, coordination and sensory skills. This includes the need for hand–eye coordination, limb coordination and the use of sensory skills such as sight, hearing, touch, taste and smell. This factor also evaluates the speed, precision and accuracy required for tasks such as keyboard skills, driving or other types of manual manipulation.",
    questions: [
      {
        topic: "Type of physical skills",
        question:
          "Does the job require fine motor skills, manual dexterity, strength or coordination to perform tasks? Examples include handling tools, machinery or delicate items.",
      },
      {
        topic: "Precision and complexity",
        question:
          "How precise are the physical tasks? Does the job require high control, accuracy or speed?",
      },
      {
        topic: "Impact on safety and performance",
        question:
          "How important is physical skill to the quality of the work, the efficiency of tasks and the safety of the worker themselves or others?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any particular physical skills (although there is likely to be some physical activity).",
      "Minimal physical skills required. The job requires basic physical skills, such as handling light objects or using simple tools.",
      "Basic physical skills required. The job requires some physical skills that involve light to moderate physical effort. There is some requirement for dexterity beyond the everyday needs of life. Manipulation may be required, but precision is not necessary.",
      "Moderate physical skills required. The job requires physical effort beyond basic tasks, such as the careful handling of fine tools, materials or people. Dexterity and hand–eye coordination are typically required. There is a need for precision and/or speed.",
      "High level of physical skills required. The job requires frequent physical exertion and the use of advanced physical skills or techniques in demanding conditions. The work generally involves detailed levels of hand–eye and sensory coordination and/or speed.",
      "Expert physical skills required. The job requires expert-level physical skills, often in specialised conditions, including high-level coordination, precision, endurance or speed. This includes high levels of hand–eye and sensory coordination, in addition to precise hand or finger dexterity, which are fundamental parts of the job.",
    ],
    mistakes: [
      "Do not overlook or undervalue manual dexterity and fine motor skills because they seem ‘natural’ or are often associated with women’s work.",
      "Do not ignore the complexity and precision required in tasks that might appear simple, but in reality demand significant physical control.",
      "Do not confuse the skill necessary to use your hands or body precisely (dexterity) with how physically tiring it is to keep doing it for a long time.",
    ],
    howToAct: [
      "Recognise fine motor skills and manual dexterity as essential, learned job qualifications, not just innate personal traits, especially in women-dominated professions.",
      "Make sure you distinguish between the physical skill required and the fatigue or strain caused by performing tasks repeatedly or over long periods (measured separately under physical effort).",
    ],
    example:
      "Professions such as physiotherapy, music, dance, jewellery design and traditional crafts (e.g. shoe repair or working with delicate materials) also demand fine motor skills. Non-automated industrial work (e.g. seafood processing, canning, textiles) and agricultural tasks such as fruit and vegetable picking require similar physical skills. This requirement involves precision and hand– eye coordination. For example, an agricultural worker responsible for planting crops and manually picking delicate fruits such as strawberries requires considerable manual dexterity and fine motor skills to avoid damaging the produce. This careful handling is a specific physical skill that must be recognised in your job evaluation. However, consider that the fatigue caused by carrying heavy baskets of fruit during long shifts should be assessed separately under the subfactor of physical effort, which measures physical strain on the body.",
  },
  {
    id: "people",
    code: "2.1",
    factor: "responsibility",
    name: "People",
    weight: 12,
    definition:
      "This subfactor assesses the extent to which a job involves responsibility for people in work activities, including the direct management, guidance, care and support of others. It can encompass a wide range of responsibilities, from formal management and leadership to those that focus on the well-being of individuals. Key activities and responsibilities are carried out through the direction, management, coordination, education, training, evaluation and motivation of others.",
    questions: [
      {
        topic: "Type of responsibility",
        question:
          "What kinds of people-related responsibilities does the job involve, including management, care or well-being?",
      },
      {
        topic: "Level of authority",
        question:
          "How much autonomy or decision-making power does the job have in relation to people?",
      },
      {
        topic: "Scope",
        question:
          "What is the scope and variety of the people for which the job is responsible, including individuals in need of care or emotional support? Does the job affect a small team, a larger group or individuals in care settings such as patients or children?",
      },
      {
        topic: "Impact",
        question:
          "To what extent does the job involve work, coordination or outcomes that affect others, including their well-being and development?",
      },
    ],
    levels: [
      "Does not apply. The job does not require any responsibility for people.",
      "Very limited. Not required to supervise or perform a caregiving role. The job may involve providing basic guidance to or orientation for others, such as helping new colleagues settle in.",
      "Basic responsibility for people. Provides support, guidance or advice to individuals or small teams. This could include assisting with personal development, providing informal mentoring or guiding others through tasks with minimal decision-making power. It may involve contributing to others’ sense of safety and comfort, but with limited decision-making authority or accountability for outcomes.",
      "Moderate responsibility for people. The job includes overseeing or coordinating the work and well-being of others. This may involve supervising, providing regular support, managing conflicts, responding to an individual’s needs and ensuring the personal and professional development of individuals.",
      "High level of responsibility for people. The job involves significant responsibility for the well-being and development of others. This includes making decisions that affect others’ jobs, tasks or welfare, such as managing teams, providing care, teaching or ensuring psychological safety. It can also include hiring, evaluating, motivating, coaching and leading workers.",
      "Full responsibility for people. The job involves complete responsibility and accountability for the well-being and development of others (including patients or children) and/or leading, directing and managing others, including setting objectives, making strategic decisions and overseeing the welfare and development of those under supervision. It includes hiring, firing, evaluating, motivating, training, developing staff, conducting pay reviews, determining pay and staffing levels, or managing complex care or support systems. The job involves overall accountability for managing an organisation’s entire workforce or a significant part of a large organisation.",
    ],
    mistakes: [
      "Do not only recognise traditional supervisory or managerial job roles with formal authority, or focus exclusively on jobs with titles such as ‘manager’ or ‘team leader’ while neglecting peer-to-peer leadership or support.",
      "Do not value leadership roles solely on the basis of their perceived contribution to productivity or profitability, which may be associated with men-dominated jobs.",
      "Do not undervalue responsibility for the well-being of others or consider this secondary to formal management duties.",
      "Make sure you do not consider interpersonal and communication skills here, as these are assessed under the interpersonal and communication skills subfactor.",
    ],
    howToAct: [
      "Recognise jobs in which mentoring or coaching is key, even if they do not involve formal authority or direct oversight. This could include providing guidance or support in team settings, sharing knowledge or influencing team dynamics.",
      "Recognise that leadership and responsibility for people also include fostering team morale, well-being and psychological safety.",
    ],
    example:
      "Think about how a community support worker in a social services organisation guides and supports a small team of volunteers. They help new volunteers to get started, assign tasks, give advice on difficult cases and keep track of the team’s progress. Although not a formal manager, the job role involves a moderate level of responsibility for people. This includes organising the team’s work, supporting volunteers and helping them to grow and develop. The worker also helps to create a positive team environment and works to solve conflicts, improving team morale. This example matches level 3 because it shows moderate responsibility through supervision and support, without full managerial authority. It also highlights mentoring, reflecting an inclusive understanding of responsibility for people beyond typical managerial jobs.",
  },
  {
    id: "goods",
    code: "2.2",
    factor: "responsibility",
    name: "Goods and equipment",
    weight: 7,
    definition:
      "This subfactor assesses the degree of responsibility a job holder has for the collection, storage, retrieval, safe use and maintenance of the material resources, including office equipment, supplies, products and machinery, required to perform a job. It also measures the value and nature of their involvement with these resources. It encompasses all aspects of responsibility, from daily use and monitoring to inventory control, equipment maintenance and ensuring the proper functioning and safety of assets.",
    questions: [
      {
        topic: "Type of responsibility",
        question:
          "Does the job involve using, operating, supervising, maintaining or repairing equipment or goods?",
      },
      {
        topic: "Level of control",
        question:
          "Is the job responsible for decision-making with regard to the allocation, repair or purchase of equipment?",
      },
      {
        topic: "Scope of responsibility",
        question:
          "What is the quantity or value of goods or equipment managed by the job holder? Does it include expensive or irreplaceable machinery or more routinely used and/or disposable tools? Assets of minimal value might include calculators, cleaning supplies and certain tools. Assets of significant value might include buildings, manufacturing and production equipment (Pay Equity Office, 2022).",
      },
      {
        topic: "Impact",
        question:
          "How critical are these goods or equipment to the overall functioning or safety of the team, organisation or service?",
      },
    ],
    levels: [
      "Not applicable. The job does not involve any responsibility for goods or equipment.",
      "Limited responsibility for goods or equipment. The job involves the care and proper use of low-value tools or materials, with minimal responsibility for their maintenance or security.",
      "Some responsibility for goods or equipment. The job involves the use and maintenance of equipment or stock, and the job holder is responsible for ensuring resources are used appropriately and safely.",
      "Moderate responsibility for goods or equipment. The job involves the regular use and maintenance of more valuable equipment or materials. It may include managing resources or ensuring equipment stays in good condition.",
      "Considerable responsibility for goods or equipment. The job involves overseeing valuable resources, making sure they are secure, maintained and functioning to meet goals. This includes protecting important physical or natural assets and deciding on the ordering of various equipment and supplies.",
      "Full responsibility for goods or equipment. The job involves managing the entire life cycle of goods or equipment, including buying, maintenance, security and disposal. It may involve handling high-value or sensitive assets and planning for long-term resource needs. This includes ordering a wide range of valuable equipment and possibly adapting or designing equipment, buildings, land or other physical resources.",
    ],
    mistakes: [
      "Avoid underestimating responsibility for goods and equipment in caregiving, education or hospitality, where equipment may be specialised or critical.",
      "Do not focus only on high-value, hi-tech machinery, which may be more common in sectors dominated by men.",
      "Do not focus solely on responsibilities for the initial acquisition or installation of equipment.",
    ],
    howToAct: [
      "Consider responsibility for shared or communal equipment, common-use tools in service industries or inventory management for supplies, even when these are in jobs traditionally seen as ‘service’ or ‘support’.",
      "Credit jobs that are responsible for ongoing maintenance, repair or ensuring the replacement of equipment when necessary.",
      "Do not forget responsibilities such as overseeing the life cycle and sustainability of products, including their eco-friendly disposal, reuse and recycling.",
    ],
    example:
      "Think about how an administrative coordinator in a school manages office equipment, teaching materials and supplies that are essential for daily operations. Their tasks include tracking inventory, ordering supplies, maintaining equipment and coordinating with students, staff and external suppliers. Although these tasks are important, they can be undervalued because the equipment is seen as being routine or of low value. The coordinator also handles the buying of eco-friendly supplies and making sure that broken equipment is properly recycled. Overseeing recycling and sustainable disposal is an essential but sometimes overlooked part of the job. This job role could correspond to level 3 with regard to responsibility for goods and equipment, as it involves the regular use and upkeep of resources and coordination to keep equipment in good condition, but without full authority over purchasing decisions.",
  },
  {
    id: "information",
    code: "2.3",
    factor: "responsibility",
    name: "Information",
    weight: 8,
    definition:
      "This subfactor assesses the degree of responsibility a job holder has for collecting, storing, retrieving, interpreting and maintaining information/data/files required to perform the job. It also assesses the nature of the ir involvement with the information. Consider both paper-based and electronic information systems.",
    questions: [
      {
        topic: "Type of responsibility",
        question:
          "Does the job involve gathering, organising, processing, disseminating or protecting information?",
      },
      {
        topic: "Level of control",
        question:
          "Does the job involve making independent decisions about the handling, sharing or archiving of information, or is this done in accordance with preset protocols?",
      },
      {
        topic: "Scope of responsibility",
        question:
          "Is the job holder responsible for managing sensitive or large-scale information (e.g. financial data, customer records, patient data, intellectual property or strategic plans)?",
      },
      {
        topic: "Impact",
        question:
          "How critical is the job in ensuring data accuracy, confidentiality and compliance with legal frameworks (e.g. the GDPR)?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any responsibility for information.",
      "Very limited responsibility for information. The job involves using basic information to perform tasks, with little or no responsibility for sourcing, processing or safeguarding the information.",
      "Limited responsibility for information. The job requires the individual to gather, process or share information in a controlled way, following guidelines or predefined procedures.",
      "Moderate responsibility for information. The job involves managing information to ensure it is accurate, of high quality and secure. The job holder may make decisions about the handling of sensitive data.",
      "Considerable responsibility for information. The job manages large amounts of valuable or sensitive information, deciding what is needed and how it is used and ensuring it is protected.",
      "Full responsibility for information. The job has major responsibility for sourcing, analysing and deciding on information use, ensuring legal and strategic compliance, and overseeing how information is managed organisation-wide.",
    ],
    mistakes: [
      "Do not focus solely on the management of structured, digital information (e.g. databases) and do not ignore unstructured data such as personal notes, verbal communications or physical documents.",
      "Make sure you do not double count: financial information is not measured here; it is measured under financial resources.",
    ],
    howToAct: [
      "Make sure you value responsibility for both structured and unstructured information, including personal health information, case files, student records, client databases, etc.",
    ],
    example:
      "A patient intake coordinator (level 3) gathers patient information during intake, maintains accurate records and helps to communicate between patients and healthcare providers. Meanwhile, a social work case manager (level 4) collects and interprets sensitive client information, keeps confidential case files and decides how and when to share data in accordance with legal and ethical rules.",
  },
  {
    id: "financial",
    code: "2.4",
    factor: "responsibility",
    name: "Financial resources",
    weight: 8,
    definition:
      "This subfactor assesses a job holder’s degree of accountability for money, financial data, financial records and related decisions, and the acquisition and/or expenditure of funds. It includes budgeting, financial planning, the authorisation of expenditure, handling of payments, financial reporting, fundraising, resource allocation and financial risk management.",
    questions: [
      {
        topic: "Type of responsibility",
        question: "Are they handling, authorising, managing, safeguarding or planning finances?",
      },
      {
        topic: "Level of control",
        question: "Does the job involve making financial decisions independently?",
      },
      {
        topic: "Scope",
        question:
          "What is the size or value of the resources managed or influenced, in the context of the organisation or sector?",
      },
      {
        topic: "Impact",
        question:
          "To what extent do financial decisions affect service delivery, compliance or strategic direction?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any responsibility for financial resources.",
      "Very limited responsibility for financial resources. The job involves handling small amounts of cash or processing simple transactions, such as recording expenses or maintaining basic financial records.",
      "Limited responsibility for financial resources. The job involves handling limited financial resources, such as managing small budgets, processing invoices or participating in financial planning discussions.",
      "Moderate responsibility for financial resources. The job requires handling significant financial resources, including managing budgets, overseeing expenditures, being accountable for spending and participating in financial decision-making.",
      "Considerable responsibility for financial resources. The job involves managing large budgets or financial portfolios, making decisions on allocations, or overseeing the financial integrity for a department or organisation. The job may include liaising with auditors or financial officers.",
      "Full responsibility for financial resources. The job involves taking complete responsibility for financial planning and oversight across the organisation, including setting budgets, developing financial policies, making strategic financial decisions affecting the entire organisation and liaising with external financial bodies or auditors.",
    ],
    mistakes: [
      "Do not assume that only very senior jobs carry financial responsibility.",
      "Do not undervalue financial tasks in non-governmental organisations or education, social services or healthcare sector jobs.",
      "Do not ignore income-related responsibilities in fundraising and community outreach.",
    ],
    howToAct: [
      "Value responsibilities that involve preparing budgets, monitoring expenditures or managing cost-efficiency, even if the job does not have final authorisation on spending.",
      "Make sure you adequately value responsibilities for grant applications, service fees, donor relations or sales performance.",
    ],
    example:
      "Think about how a community outreach officer in a non-profit organisation – a sector that is often women- dominated – contributes to the financial sustainability of their organisation. Such a worker prepares and monitors small-to-medium budgets, processes invoices, tracks expenditures and participates in financial planning. The job role also involves supporting fundraising by preparing complex grant applications and managing donor relationships. While the job holder may not have final authority over spending, the job role typically reflects a moderate level of responsibility for financial resources (level 3), requiring careful financial management to ensure compliance and support organisational goals. These financial responsibilities can sometimes be undervalued, highlighting the need to recognise this accountability fairly.",
  },
  {
    id: "mentalEffort",
    code: "3.1",
    factor: "effort",
    name: "Mental effort",
    weight: 5,
    definition:
      "This subfactor assesses the duration and intensity of the cognitive effort required to perform the job. Mental effort is related to the amount of concentration, attentiveness and alertness needed in terms of thinking, watching, listening, interpreting and driving, among other actions, all of which can cause fatigue. All tasks that require concentration and deal with unexpected situations should be considered.",
    questions: [
      {
        topic: "Type of mental effort",
        question:
          "Does the job require decision-making, problem-solving, analysis or judgement under pressure?",
      },
      {
        topic: "Complexity",
        question:
          "How complex are the problems to be solved? Does the job require multi-step decision-making, anticipating consequences or interpreting ambiguous information?",
      },
      {
        topic: "Duration",
        question:
          "For h ow long must the mental effort be sustained? Is it a task that requires constant cognitive effort throughout a shift or working day, or only at specific moments?",
      },
      {
        topic: "Frequency",
        question:
          "How often does the job require sustained mental effort, such as long hours of concentration or quick thinking in high-pressure situations?",
      },
      {
        topic: "Impact",
        question:
          "Does the level of mental effort affect outcomes, such as service quality, safety, decision accuracy or problem resolution?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any significant mental effort or concentration.",
      "Limited mental effort. The job involves tasks that require only low levels of mental effort, such as basic attention and following simple instructions with few competing demands for attention.",
      "Moderate mental effort. The job involves tasks that require focus, such as analysing straightforward information or performing repetitive tasks that require attention to detail.",
      "High level of mental effort. The job involves frequent concentration on complex tasks that require considerable mental effort, such as interpreting complex data.",
      "Very high level of mental effort. The job requires continuous high-level mental concentration, with few or no breaks, involving intellectually demanding tasks that require continuous focus.",
      "Intense mental effort. The job involves sustained, intense mental effort for long periods, often requiring creative thinking and managing complex or novel problems.",
    ],
    mistakes: [
      "Make sure you do not overvalue the mental effort involved in jobs associated with technical skills or management, which are often dominated by men.",
      "Do not overlook the alertness and focus required in jobs that involve constant vigilance – for example, working with children demands continuous attention to safety, behaviour and needs.",
    ],
    howToAct: [
      "Consider the mental effort required in jobs that involve multitasking or managing multiple priorities at once, especially in high-stress environments. This can apply to jobs in healthcare, customer service and emergency response.",
    ],
    example:
      "Many professions traditionally dominated by women, often considered to be unskilled or lower-skilled, require a high level of mental effort in order to perform tasks effectively. For example, the secretarial profession demands sustained concentration in the use of language, including writing and proofreading texts, adapting their tone and style to suit different audiences and managing multiple communication channels simultaneously (Ministry of Labour and Social Economy et al., 2022). These tasks require constant attentiveness, multitasking and critical thinking, illustrating the significant cognitive demands of the job.",
  },
  {
    id: "emotionalEffort",
    code: "3.2",
    factor: "effort",
    name: "Psychosocial and emotional effort",
    weight: 6,
    definition:
      "Psychosocial and emotional effort is the emotional energy required to manage and respond to a job’s psychological and interpersonal demands, including situations of stress or pressure arising from the interpersonal relationships related to the job. It includes the ability to regulate one’s own emotions, language, expressions and reactions; maintain composure under stress; support others emotionally; handle conflict sensitively and ethically; and sustain interpersonal relationships, often in emotionally charged environments.",
    questions: [
      {
        topic: "Type of effort",
        question:
          "Does the job involve managing emotions, dealing with distress, providing emotional support or resolving interpersonal conflict?",
      },
      {
        topic: "Intensity",
        question:
          "How intense is the emotional labour required? Does the job require high levels of empathy, emotional regulation or stress management?",
      },
      {
        topic: "Duration",
        question:
          "How long is the emotional effort sustained? Does it last for entire shifts, specific tasks or occasional moments of crisis?",
      },
      {
        topic: "Frequency",
        question:
          "How often does the job require significant emotional effort? Is it a daily expectation or occasional?",
      },
      {
        topic: "Impact",
        question: "How do the job’s emotional demands affect well-being or job performance?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any psychosocial or emotional effort.",
      "Minimal psychosocial and emotional effort. There is little to no need to manage emotional responses. The job involves minimal exposure to emotionally demanding situations.",
      "Occasional psychosocial and emotional effort. The job requires occasional involvement in emotionally demanding situations, such as handling minor conflicts or dealing with upset individuals.",
      "Moderate psychosocial and emotional effort. The job requires the regular management of emotional responses, such as dealing with sensitive or challenging individuals or situations.",
      "High psychosocial and emotional effort. The job involves frequent exposure to emotionally charged situations, requiring significant resilience and managing personal emotions while interacting with others.",
      "Extreme psychosocial and emotional effort. The job involves constant exposure to highly emotional or stressful circumstances, requiring continuous emotional control and the ability to manage highly sensitive, vulnerable or distressed individuals.",
    ],
    mistakes: [
      "Do not ignore the emotional toll of jobs with high levels of responsibility for others’ well-being or leadership jobs, particularly when managing teams in high-stress or emotionally challenging environments.",
      "Do not confuse interpersonal and communication skills with psychosocial and emotional effort. Interpersonal and communication skills are about the ability to articulate ideas, listen and convey information. In contrast, psychosocial and emotional effort is about the emotional energy required in the job, including aspects such as empathy, stress management and emotional regulation.",
      "Do not confuse psychosocial and emotional effort with psychosocial risks related to working conditions (see the environment subfactor, including physical, psychological or emotional environments). Psychosocial and emotional effort reflects challenges related to demands of the job (e.g. intervening in emotionally charged situations while maintaining emotional regulation). The psychosocial risks assessed in the environment (physical, psychological or emotional) subfactor relate to the working conditions under which the job is performed. These include, for example, exposure to harassment.",
    ],
    howToAct: [
      "Acknowledge the emotional toll of being responsible for the health, safety or emotional well-being of others, especially in high-risk or vulnerable settings.",
      "Recognise that emotional regulation and managing team dynamics can require significant mental effort, especially in jobs that provide support, resolve conflicts and maintain morale under pressure.",
    ],
    example:
      "Professions with a large presence of women, such as healthcare, social care and customer service professions, often involve implicit emotional tensions. Regular contact with disadvantaged or especially vulnerable groups (e.g. those at risk of social exclusion, in a situation of illness or affected by abuse) or negotiating with the public and customers can lead to disrespectful or aggressive situations. These interactions increase anxiety and stress (Ministry of Labour and Social Economy et al., 2022). For example, a nurse in an emergency room expends psychosocial and emotional efforts to manage the emotional strain of dealing with distressed patients and families, remaining empathetic yet emotionally balanced in high- pressure situations. It is important not to confuse interpersonal and communication skills with psychosocial and emotional effort. In this example, the nurse also uses interpersonal and communication skills to clearly explain medical procedures and actively listen to patients and colleagues.",
  },
  {
    id: "physicalEffort",
    code: "3.3",
    factor: "effort",
    name: "Physical effort",
    weight: 4,
    definition:
      "This subfactor assesses the duration and intensity of physical effort required to perform the job. Physical effort is related to physical demands on the body or the energy needed to perform tasks such as standing, walking, lifting, typing or remaining in one position for long periods. Nowadays, it is important to consider whether some physical demands are alleviated by machinery or automation, which might reduce the intensity or frequency of the physical effort involved.",
    questions: [
      {
        topic: "Type of physical effort",
        question:
          "Does the job require lifting (objects, patients, children), carrying, standing or walking?",
      },
      {
        topic: "Intensity",
        question:
          "How physically demanding are the tasks? Is the job strenuous, involving heavy lifting, or less physically intense but still requiring significant skill, such as touch typing at the speed of conversation, as in settings such as courtrooms?",
      },
      {
        topic: "Duration",
        question:
          "How long must the physical effort be sustained? Does the job require extended periods of activity (e.g. standing, walking, lifting)?",
      },
      {
        topic: "Frequency",
        question:
          "How often must the physical effort be exerted? Is it a constant requirement, or is it only needed at specific times or for certain tasks?",
      },
      {
        topic: "Impact",
        question:
          "How does the physical effort affect the worker’s health, levels of fatigue or well-being? Does it contribute to work-related injuries or long-term physical strain?",
      },
    ],
    levels: [
      "Not applicable. The job does not require any physical effort.",
      "Minimal physical effort. The job involves light physical tasks, such as occasional lifting or moving light objects.",
      "Low physical effort. The job involves moderate physical effort, such as standing for long periods, occasional lifting, or repetitive or monotonous movements.",
      "Moderate physical effort. The job requires consistent physical effort, such as regular lifting of moderate weight, manual handling of materials, prolonged standing or walking or monotonous or repetitive hand/arm movements.",
      "High physical effort. The job requires frequent heavy lifting, physically demanding and repetitive tasks, or prolonged exposure to physically tough conditions.",
      "Extreme physical effort. The job requires continuous heavy and/or physical effort, often in challenging conditions, including lifting heavy loads, extensive manual labour, physically demanding environments, or tasks that involve sustained, monotonous motion with little opportunity for rest or variation.",
    ],
    mistakes: [
      "Do not only assess physical effort in jobs that involve manual labour or construction, which are typically dominated by men.",
      "Do not underestimate the physical toll of repetitive tasks often seen in women-dominated jobs such as cashiers and assembly line workers.",
      "Do not include the physical environment (e.g. where there is heat, noise or interruptions) or conditions such as travel – these fall under the subfactor of working conditions.",
      "Do not confuse the physical effort – the sustained energy and strain required – with physical skills such as dexterity or fine motor control, which are assessed separately.",
    ],
    howToAct: [
      "Ensure the effort involved in jobs that require physical tasks, such as lifting, carrying or standing for long periods, is thoroughly assessed. These tasks can be underestimated because care and service work are commonly seen as less physically demanding or are associated primarily with women, leading to their physical demands being overlooked.",
    ],
    example:
      "Jobs in construction, manufacturing or warehousing are often given higher ratings in job evaluations due to these physical elements. However, jobs mostly done by women, such as caregiving or nursing, also require considerable physical strength and endurance, such as that necessary to lift patients or clean equipment. Think about early childhood educators, retail workers, cleaners and food service staff. All of these workers may also perform physically demanding work, including standing for long hours, lifting children or heavy items and doing repetitive tasks. Assuming that men-dominated jobs are more physically demanding ignores the comparable physical demands in women-dominated jobs and can contribute to an unfair job evaluation.",
  },
  {
    id: "environment",
    code: "4.1",
    factor: "conditions",
    name: "Environment (physical, psychological or emotional)",
    weight: 7,
    definition:
      "This subfactor assesses the nature and severity of the working conditions and hazards that affect the job. Physical conditions can include exposure to chemicals, moving equipment, flames, radiation, infectious diseases and physical risks such as cuts, abrasions and the potential for dismemberment; risks from vibrations, noise, temperature and humidity; and the presence of chemical or biological agents that can cause harm (Ministry of Labour and Social Economy et al., 2022; Pay Equity Office, 2022). It also covers the possibility of illness in addition to psychosocial risks such as isolation, repetitive tasks, risks and threats of violence and harassment (including sexual and gender-based harassment), whether intentional or unintentional. It also includes stress or anxiety. New forms of risk at work, such as technostress and computer fatigue, are also considered(Ministry of Labour and Social Economy et al., 2022).",
    questions: [
      {
        topic: "Type of environment",
        question:
          "Is the work performed in a safe, comfortable, clean and healthy environment? Does the job involve high-risk environments such as construction sites, healthcare settings or industrial work? Does the job expose workers to verbal or physical violence? How often is this experienced, and what measures are in place to manage or mitigate these risks?",
      },
      {
        topic: "Environmental hazards",
        question:
          "Is the worker exposed to physical dangers, toxic substances or unhealthy conditions such as high levels of noise, extreme temperatures or poor air quality?",
      },
      {
        topic: "Level of comfort",
        question:
          "Is the worker’s environment conducive to productivity and well - being, with appropriate breaks, ergonomic designs or stress-reducing factors such as natural light and quiet spaces?",
      },
      {
        topic: "Impact",
        question:
          "How do these environmental factors affect workers’ health, safety or job performance? Are there long-term consequences for working in this environment, such as fatigue, stress or injury? How does the verbal or physical violence encountered in the job affect the worker’s overall performance, mental health and job satisfaction over time?",
      },
    ],
    levels: [
      "Not applicable. No exposure to unpleasant, dangerous or challenging physical, psychological or emotional working conditions, and no risk of injury or health issues.",
      "Minimal exposure to hazards or stress. The job involves little or no exposure to physical hazards (e.g. chemicals, moving equipment, noise) and minimal emotional or psychological risks (e.g. occasional routine tasks with no emotional burden). There is minor exposure to dust, dirt, fumes, noise, waste, poor lighting, etc.",
      "Occasional exposure to hazards or stress. The job involves occasional exposure to mild physical risks (e.g. working with light machinery, occasional noise) or psychosocial risks (e.g. occasional interpersonal conflict or minor repetitive tasks). Exposure occurs two to three times a year.",
      "Regular exposure to hazards or stress. The job requires regular exposure to physical hazards psychological risks (e.g. isolation, repetitive tasks or occasional threats of violence). It may occur monthly or as a build-up of milder hazards.",
      "Frequent exposure to significant hazards or stress. The job involves frequent exposure to physical risks (e.g. working in high-risk environments, regularly handling chemicals or from safety risks such as cuts or abrasions) and significant psychosocial risks (e.g. handling threats of violence, harassment or prolonged exposure to high-pressure situations).",
      "Constant exposure to extreme hazards or stress. The job requires continuous exposure to severe physical hazards (e.g. handling dangerous chemicals, working with heavy machinery or significant risk of injury) and high-level psychosocial risks (e.g. high emotional strain, constant exposure to harassment or working in crisis situations).",
    ],
    mistakes: [
      "Do not focus solely on physical hazards while ignoring psychological risks or the risk of verbal or physical violence, especially in care or customer-facing roles.",
    ],
    howToAct: [
      "Assess all physical and psychosocial risks, including exposure to noise, temperature, chemicals or violence.",
      "Evaluate how often workers are exposed to these risks and for how long.",
    ],
    example:
      "Jobs that require public interaction, such as customer service or caregiving, are particularly susceptible to physical and psychosocial risks, which may be overlooked. For instance, cleaners handle chemicals that pose health risks, nurses are exposed to contagious diseases, and domestic workers often work alone, which can put them at greater risk of sexual harassment or other forms of violence (Ministry of Labour and Social Economy et al., 2022).",
  },
  {
    id: "organisational",
    code: "4.2",
    factor: "conditions",
    name: "Organisational environment",
    weight: 3,
    definition:
      "This subfactor assesses the duration of a job role’s working day, including night shifts and irregular working hours. It considers the need to adapt to unusual working hours, such as night-time work or shift work, and its impact on the availability of time for rest.This includes working on public holidays or weekends, the ability to establish holiday periods and permanent digital connectivity. It also evaluates the requirement for travel, including trips outside the workplace or between workplaces, and the nature and duration of these journeys (Ministry of Labour and Social Economy et al., 2022).",
    questions: [
      {
        topic: "Working hours",
        question:
          "Does the job involve night shifts, irregular hours or weekend work? How often are workers expected to work outside traditional hours?",
      },
      {
        topic: "Rest time",
        question:
          "How does the job affect the availability of rest time or holiday periods? Does the job have flexibility, or are there strict rules about when holidays can be taken?",
      },
      {
        topic: "Travel requirements",
        question:
          "Does the job require travel, whether this involves commuting between locations, business trips or visits to clients? How often does travel occur, and how does it affect the job holder’s work–life balance?",
      },
    ],
    levels: [
      "Not applicable. The job does not involve irregular working hours, travel or other organisational demands.",
      "Minimal organisational demands. The job requires standard working hours with no night shifts or irregular schedules. There is little or no need for travel or digital connectivity beyond typical working hours.",
      "Occasional organisational demands. The job may involve occasional irregular hours (e.g. the requirement to work weekends or holidays), minimal travel or limited digital connectivity outside normal working hours.",
      "Regular organisational demands. The job requires regular shift work, night shifts or irregular hours and involves moderate travel or frequent digital connectivity after hours.",
      "Frequent organisational demands. The job requires frequent night shifts, irregular working hours and extended periods of digital connectivity. Regular travel between locations or to external workplaces is also required.",
      "Constant organisational demands. The job involves constant exposure to irregular working hours, frequent night shifts, extensive travel (both local and international) and ongoing digital connectivity, often requiring work outside normal hours, including weekends and public holidays.",
    ],
    mistakes: [
      "Do not ignore strain from unsociable hours or irregular schedules.",
      "Do not overlook the effects of long or frequent travel.",
      "Do not neglect mental load resulting from constant connectivity.",
      "Do not focus solely on physical conditions; organisational factors matter too.",
      "Do not assume that adaptation to shift work is easy or without impact.",
    ],
    howToAct: [
      "Consider the impact of night shifts, irregular hours and weekend work on well-being.",
      "Include travel requirements between sites or to external locations.",
      "Account for permanent digital connectivity and on-call duties outside working hours.",
      "Factor in how schedules affect rest, holidays and health.",
    ],
    example:
      "Professions dominated by women, such as healthcare or retail, often expect workers to be flexible over the hours they work (irregular shifts, evenings, weekends). This flexibility is often taken for granted, ignoring the strain it places on work–life balance. Part-time or flexible jobs may be undervalued in terms of workload. Women in caregiving, education or healthcare often undertake frequent travel to meet clients/patients. This travel may be undervalued in comparison with that undertaken as part of men-dominated jobs (sales, consulting), in which travel is seen as a career opportunity and visibly compensated. In addition, the risks associated with travel (lone working, night-time travel) disproportionately affect women. These risks are not adequately factored into job evaluations, leading to insufficient pay for extra safety measures. Recognise and evaluate these demands to ensure a fair job evaluation.",
  },
];

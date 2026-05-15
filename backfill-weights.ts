import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

function getPriorityWeight(priority: string) {
  switch (priority) {
    case "Low": return 1;
    case "Medium": return 2;
    case "High": return 3;
    case "Critical": return 4;
    default: return 2;
  }
}

async function main() {
  const bugs = await prisma.bug.findMany();
  
  let updated = 0;
  for (const bug of bugs) {
    const weight = getPriorityWeight(bug.priority);
    if (bug.priorityWeight !== weight) {
      await prisma.bug.update({
        where: { id: bug.id },
        data: { priorityWeight: weight }
      });
      updated++;
    }
  }

  console.log(`Backfilled priorityWeight for ${updated} bugs.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

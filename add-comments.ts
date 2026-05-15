import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  const bugs = await prisma.bug.findMany();

  if (users.length === 0 || bugs.length === 0) {
    console.log("No users or bugs found. Run the seed script first.");
    return;
  }

  const comments = [
    "I'm looking into this right now.",
    "Can someone provide more logs?",
    "I was able to reproduce this locally.",
    "This seems to be related to the recent deployment.",
    "Good catch, I'll submit a PR shortly.",
    "We should escalate this if it's affecting paying customers.",
    "Waiting for feedback from the product team.",
    "The fix has been merged into main.",
    "I cannot reproduce this. Closing for now. Reopen if it happens again.",
    "Has anyone checked the backend service logs?"
  ];

  let commentsAdded = 0;

  for (const bug of bugs) {
    // Add 1 to 3 random comments per bug
    const numComments = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numComments; i++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomComment = comments[Math.floor(Math.random() * comments.length)];
      
      await prisma.comment.create({
        data: {
          body: randomComment,
          authorId: randomUser.id,
          bugId: bug.id
        }
      });

      await prisma.activity.create({
        data: {
          action: 'comment_added',
          description: 'Added a comment',
          actorId: randomUser.id,
          bugId: bug.id,
        }
      });
      
      commentsAdded++;
    }
  }

  console.log(`Successfully added ${commentsAdded} comments across ${bugs.length} bugs!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

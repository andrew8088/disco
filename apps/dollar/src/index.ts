import * as Template from "./template";

async function main() {
  const templates = Template.find();
  console.log(templates);
}

main().catch((error) => {
  if (error instanceof Error && error.name === "ExitPromptError") {
    console.log("👋 until next time!");
  } else {
    throw error;
  }
});

import { Liveblocks } from "@liveblocks/node";
import { auth } from "../../../auth";

const liveblocks = new Liveblocks({
  secret: process.env.LIVEBLOCKS_SECRET_KEY!,
});

export async function POST(request: Request) {
  const session = await auth();

  const user = session?.user;
  const name = user?.name ?? "Anonymous";
  const email = user?.email ?? "anonymous";
  const image = user?.image ?? "";

  const liveblocksSession = liveblocks.prepareSession(`user-${email}`, {
    userInfo: {
      name,
      picture: image,
    },
  });

  // Give full access to all rooms (adjust as needed)
  liveblocksSession.allow("*", liveblocksSession.FULL_ACCESS);

  const { status, body } = await liveblocksSession.authorize();
  return new Response(body, { status });
}

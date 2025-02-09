"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { handleSubmit } from "@/lib/actions/createChallenge";
import { Challenge } from "@prisma/client";
import {
  handleChallengeDelete,
  handleChallengeUpdate,
} from "@/lib/actions/updateChallenge";
import { useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { BackButton } from "./BackButton";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { trpc } from "@/lib/util/trpc";
import { createChallenge } from "@/lib/db/challenge";

type ChallengeFormProps = {
  defaultValues?: z.infer<typeof challengeFormSchema>;
  onSubmit: (values: z.infer<typeof challengeFormSchema>) => void;
  onDelete?: () => void;
  disabled?: boolean;
};

export const challengeFormSchema = z.object({
  title: z.string().nonempty({
    message: "Title is required.",
  }),
  wish: z.string().nonempty({
    message: "Wish is required.",
  }),
  dailyAction: z.string().nonempty({
    message: "Daily action is required.",
  }),
  icon: z
    .string()
    .nonempty({ message: "Icon is required." })
    .refine(
      (value) => {
        const singleEmojiRegex =
          /^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})?)$/u;
        return singleEmojiRegex.test(value);
      },
      { message: "Icon must be a single emoji." },
    ),
});

function ChallengeForm({
  defaultValues,
  onSubmit,
  onDelete,
  disabled,
}: ChallengeFormProps) {
  const form = useForm<z.infer<typeof challengeFormSchema>>({
    resolver: zodResolver(challengeFormSchema),
    defaultValues: defaultValues || {
      title: "",
      wish: "",
      dailyAction: "",
      icon: "✅",
    },
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex w-full flex-col gap-2"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Hydration Challenge" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="wish"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Wish</FormLabel>
              <FormControl>
                <Input placeholder="Drinking more water every day" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dailyAction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Daily Action</FormLabel>
              <FormControl>
                <Input
                  placeholder="I will drink 8 glasses of water every day"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Icon</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="mt-4 flex justify-between">
          <Button type="submit" disabled={disabled}>
            Submit
          </Button>
          {defaultValues && onDelete && (
            <Button
              type="button"
              onClick={onDelete}
              variant="destructive"
              disabled={disabled}
            >
              Delete
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}

export function CreateChallenge() {
  const utils = trpc.useUtils();

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const { mutate } = trpc.challenge.createChallenge.useMutation({
    onSuccess: async (challenge) => {
      const params = new URLSearchParams(searchParams);
      params.set("challenge", challenge.id);
      replace(`${pathname}?${params.toString()}`);
    },
    onSettled: () => {
      utils.challenge.getChallenges.invalidate();
    },
  });

  const onSubmit = async (values: z.infer<typeof challengeFormSchema>) => {
    mutate(values);
  };

  return (
    <Card className="w-full md:w-3/4 lg:w-1/2 xl:w-1/3">
      <CardHeader>
        <div className="mb-6">
          <BackButton />
        </div>
        <CardTitle className="text-xl font-bold">Create Challenge</CardTitle>
        <CardDescription>Set up your new challenge details.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChallengeForm onSubmit={onSubmit} />
      </CardContent>
    </Card>
  );
}

export function EditChallenge({
  challenge,
  setIsDialogOpen,
}: {
  challenge: Challenge;
  setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (values: z.infer<typeof challengeFormSchema>) => {
    startTransition(async () => {
      await handleChallengeUpdate({
        ...challenge,
        ...values,
      });

      setIsDialogOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      await handleChallengeDelete(challenge.id);

      setIsDialogOpen(false);
    });
  };

  const defaultValues = {
    title: challenge.title,
    wish: challenge.wish,
    dailyAction: challenge.dailyAction,
    icon: challenge.icon,
  };

  return (
    <ChallengeForm
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      disabled={isPending}
    />
  );
}

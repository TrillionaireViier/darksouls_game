// Copyright Dark Souls Game Project. All Rights Reserved. UE 5.8

using UnrealBuildTool;

public class DarkSoulsGame : ModuleRules
{
	public DarkSoulsGame(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] {
			"Core",
			"CoreUObject",
			"Engine",
			"InputCore",
			"EnhancedInput",
			"UMG",
			"Slate",
			"SlateCore",
			"AIModule",
			"GameplayTasks"
		});

		PrivateDependencyModuleNames.AddRange(new string[] { });
	}
}
